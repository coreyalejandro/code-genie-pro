from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import base64
import tempfile
import asyncio
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent, FileContentWithMimeType

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class ProcessingRequest(BaseModel):
    session_id: str
    input_type: str  # 'text', 'image', 'audio', 'code'
    content: str
    description: Optional[str] = None

class ProcessingResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    input_type: str
    pseudocode: str
    flowchart: str
    code_outputs: dict
    code_analysis: dict = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class SessionHistory(BaseModel):
    session_id: str
    results: List[ProcessingResult]

# Programming languages configuration
PROGRAMMING_LANGUAGES = {
    "python": "Python",
    "javascript": "JavaScript",
    "java": "Java", 
    "cpp": "C++",
    "csharp": "C#",
    "go": "Go",
    "rust": "Rust",
    "typescript": "TypeScript",
    "swift": "Swift",
    "kotlin": "Kotlin"
}

async def get_gemini_chat(session_id: str):
    """Create a new Gemini chat instance for each request"""
    return LlmChat(
        api_key=os.environ.get('GEMINI_API_KEY'),
        session_id=session_id,
        system_message="""You are an expert programming assistant that converts any input into pseudocode, flowcharts, and multiple programming languages.

When given any input (text description, code, image, or audio transcript), you should:
1. First understand the logic/algorithm described
2. Create clear, detailed pseudocode
3. Generate a Mermaid.js flowchart representation
4. Convert to the requested programming language

For pseudocode, use clear, structured format with proper indentation.
For flowcharts, use Mermaid.js syntax with proper flow control.
For code, write clean, well-commented, production-ready code.

Always be thorough and accurate in your conversions."""
    ).with_model("gemini", "gemini-2.0-flash")

async def process_with_gemini(session_id: str, content: str, input_type: str, description: str = None):
    """Process input with Gemini and generate pseudocode, flowchart, and code"""
    try:
        chat = await get_gemini_chat(session_id)
        
        # Create the processing prompt
        if input_type == "text":
            prompt = f"Convert this text description into pseudocode, flowchart, and code:\n\n{content}"
        elif input_type == "code":
            prompt = f"Analyze this code and create pseudocode, flowchart, and equivalent implementations:\n\n{content}"
        elif input_type == "image":
            prompt = f"Analyze this image (which contains {description or 'programming-related content'}) and convert it into pseudocode, flowchart, and code:\n\nImage data: {content}"
        elif input_type == "audio":
            prompt = f"Based on this audio transcript: '{content}', create pseudocode, flowchart, and code implementation."
        else:
            prompt = f"Process this input and create pseudocode, flowchart, and code:\n\n{content}"

        # Step 1: Generate pseudocode
        pseudocode_message = UserMessage(
            text=f"{prompt}\n\nPlease provide ONLY the pseudocode in a clear, structured format. Use proper indentation and clear logic flow."
        )
        pseudocode_response = await chat.send_message(pseudocode_message)
        
        # Step 2: Generate flowchart
        flowchart_message = UserMessage(
            text=f"Based on this pseudocode:\n\n{pseudocode_response}\n\nCreate a Mermaid.js flowchart. Provide ONLY the Mermaid.js code starting with 'flowchart TD' or 'graph TD'."
        )
        flowchart_response = await chat.send_message(flowchart_message)
        
        # Step 3: Generate code for all languages
        code_outputs = {}
        for lang_key, lang_name in PROGRAMMING_LANGUAGES.items():
            code_message = UserMessage(
                text=f"Convert this pseudocode to {lang_name}:\n\n{pseudocode_response}\n\nProvide ONLY the {lang_name} code, clean and well-commented."
            )
            code_response = await chat.send_message(code_message)
            code_outputs[lang_key] = code_response
        
        return {
            "pseudocode": pseudocode_response,
            "flowchart": flowchart_response,
            "code_outputs": code_outputs
        }
        
    except Exception as e:
        logging.error(f"Error processing with Gemini: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI processing failed: {str(e)}")

async def analyze_code_with_ai(session_id: str, pseudocode: str, code_outputs: dict):
    """Analyze code for complexity, optimization opportunities, and quality"""
    try:
        chat = await get_gemini_chat(session_id)
        
        # Analyze the Python version (as representative)
        python_code = code_outputs.get('python', '')
        
        analysis_prompt = f"""Analyze this code and provide:
1. Time complexity (Big O notation)
2. Space complexity (Big O notation)  
3. Code quality score (1-10)
4. 3 specific optimization suggestions
5. 2 alternative approaches
6. Learning insights for beginners

Pseudocode:
{pseudocode}

Python Code:
{python_code}

Format response as JSON:
{{
  "time_complexity": "O(...)",
  "space_complexity": "O(...)",
  "quality_score": 8,
  "optimizations": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "alternatives": ["approach 1", "approach 2"],
  "learning_insights": ["insight 1", "insight 2"]
}}"""

        analysis_message = UserMessage(text=analysis_prompt)
        response = await chat.send_message(analysis_message)
        
        # Parse JSON response
        import json
        try:
            return json.loads(response)
        except:
            # Fallback if JSON parsing fails
            return {
                "time_complexity": "Analysis pending",
                "space_complexity": "Analysis pending", 
                "quality_score": 7,
                "optimizations": ["Use more efficient algorithms", "Optimize memory usage", "Add error handling"],
                "alternatives": ["Iterative approach", "Dynamic programming approach"],
                "learning_insights": ["Understanding complexity is key", "Consider edge cases"]
            }
            
    except Exception as e:
        logging.error(f"Error analyzing code: {str(e)}")
        return {
            "time_complexity": "Analysis failed",
            "space_complexity": "Analysis failed",
            "quality_score": 5,
            "optimizations": ["Analysis temporarily unavailable"],
            "alternatives": ["Analysis temporarily unavailable"], 
            "learning_insights": ["Analysis temporarily unavailable"]
        }

@api_router.post("/process", response_model=ProcessingResult)
async def process_input(request: ProcessingRequest):
    """Process multimodal input and generate pseudocode, flowchart, and code"""
    try:
        # Process with Gemini
        result = await process_with_gemini(
            request.session_id, 
            request.content, 
            request.input_type,
            request.description
        )
        
        # Create result object
        processing_result = ProcessingResult(
            session_id=request.session_id,
            input_type=request.input_type,
            pseudocode=result["pseudocode"],
            flowchart=result["flowchart"],
            code_outputs=result["code_outputs"]
        )
        
        # Save to database
        await db.processing_results.insert_one(processing_result.dict())
        
        return processing_result
        
    except Exception as e:
        logging.error(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/process-image")
async def process_image(
    file: UploadFile = File(...),
    session_id: str = Form(...),
    description: str = Form(None)
):
    """Process uploaded image"""
    try:
        # Read and encode image
        content = await file.read()
        base64_content = base64.b64encode(content).decode('utf-8')
        
        # Create processing request
        request = ProcessingRequest(
            session_id=session_id,
            input_type="image",
            content=base64_content,
            description=description
        )
        
        # Process the image
        result = await process_input(request)
        return result
        
    except Exception as e:
        logging.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/session/{session_id}", response_model=SessionHistory)
async def get_session_history(session_id: str):
    """Get processing history for a session"""
    try:
        results = await db.processing_results.find(
            {"session_id": session_id}
        ).sort("timestamp", -1).to_list(100)
        
        processing_results = [ProcessingResult(**result) for result in results]
        
        return SessionHistory(
            session_id=session_id,
            results=processing_results
        )
        
    except Exception as e:
        logging.error(f"Error getting session history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/")
async def root():
    return {"message": "AI Multimodal Coding Assistant API"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()