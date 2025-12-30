from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
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
import asyncio
import google.generativeai as genai  # type: ignore[reportMissingImports]

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
    target_language: Optional[str] = None

class ProcessingResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    input_type: str
    pseudocode: str
    flowchart: str
    code_outputs: dict
    code_analysis: dict = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class UserProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    skill_level: str = "beginner"  # beginner, intermediate, advanced
    learning_preferences: dict = Field(default_factory=dict)
    interaction_history: List[dict] = Field(default_factory=list)
    knowledge_gaps: List[str] = Field(default_factory=list)
    completed_concepts: List[str] = Field(default_factory=list)
    last_updated: datetime = Field(default_factory=datetime.utcnow)

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

# Initialize Gemini API
genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))

SYSTEM_MESSAGE = """You are an expert programming assistant that converts any input into pseudocode, flowcharts, and multiple programming languages.

When given any input (text description, code, image, or audio transcript), you should:
1. First understand the logic/algorithm described
2. Create clear, detailed pseudocode
3. Generate a Mermaid.js flowchart representation
4. Convert to the requested programming language

For pseudocode, use clear, structured format with proper indentation.
For flowcharts, use Mermaid.js syntax with proper flow control.
For code, write clean, well-commented, production-ready code.

Always be thorough and accurate in your conversions."""

async def get_gemini_model():
    """Get Gemini model instance"""
    # Configure API key if not already configured
    api_key = os.environ.get('GEMINI_API_KEY')
    if api_key:
        genai.configure(api_key=api_key)
    
    return genai.GenerativeModel(
        model_name='gemini-1.5-flash',  # Using stable model with better quota limits
        system_instruction=SYSTEM_MESSAGE
    )

async def process_with_gemini(session_id: str, content: str, input_type: str, description: str = None, target_language: str = None):
    """Process multimodal input and generate pseudocode, flowchart, and code"""
    try:
        model = await get_gemini_model()
        
        # Generate pseudocode
        if input_type == "code":
            if target_language:
                pseudocode_prompt = f"Convert this code to {target_language}. Only return the converted code, no explanations:\n\n{content}"
            else:
                pseudocode_prompt = f"Analyze this code and create pseudocode, flowchart, and equivalent implementations:\n\n{content}"
        elif input_type == "text":
            pseudocode_prompt = f"Convert this text description into pseudocode, flowchart, and code:\n\n{content}"
        elif input_type == "image":
            pseudocode_prompt = f"Analyze this image (which contains {description or 'programming-related content'}) and convert it into pseudocode, flowchart, and code:\n\nImage data: {content}"
        elif input_type == "audio":
            pseudocode_prompt = f"Based on this audio transcript: '{content}', create pseudocode, flowchart, and code implementation."
        else:
            pseudocode_prompt = f"Process this input and create pseudocode, flowchart, and code:\n\n{content}"
        
        prompt = f"{pseudocode_prompt}\n\nPlease provide ONLY the pseudocode in a clear, structured format. Use proper indentation and clear logic flow."
        response = await asyncio.to_thread(model.generate_content, prompt)
        pseudocode_response = response.text
        
        # If target_language specified for code translation, return early with just that language
        if input_type == "code" and target_language:
            # Direct translation without pseudocode generation
            translate_prompt = f"Convert this code directly to {target_language}. Return only clean, working {target_language} code:\n\n{content}"
            response = await asyncio.to_thread(model.generate_content, translate_prompt)
            translated_code = response.text
            
            return {
                "pseudocode": translated_code,  # Contains the translated code
                "flowchart": "",
                "code_outputs": {target_language: translated_code}
            }
        
        # Generate flowchart (Mermaid syntax)
        flowchart_prompt = f"Based on this pseudocode:\n\n{pseudocode_response}\n\nCreate a Mermaid.js flowchart. Provide ONLY the Mermaid.js code starting with 'flowchart TD' or 'graph TD'."
        response = await asyncio.to_thread(model.generate_content, flowchart_prompt)
        flowchart_response = response.text
        
        # Generate code in multiple languages
        code_outputs = {}
        for lang_key, lang_name in PROGRAMMING_LANGUAGES.items():
            code_prompt = f"Convert this pseudocode to {lang_name}:\n\n{pseudocode_response}\n\nProvide ONLY the {lang_name} code, clean and well-commented."
            response = await asyncio.to_thread(model.generate_content, code_prompt)
            code_outputs[lang_key] = response.text
        
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
        model = await get_gemini_model()
        
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

        response = await asyncio.to_thread(model.generate_content, analysis_prompt)
        
        # Parse JSON response
        import json
        try:
            return json.loads(response.text)
        except Exception:
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
            request.description,
            getattr(request, 'target_language', None)
        )
        
        # Analyze code quality and complexity
        code_analysis = await analyze_code_with_ai(
            request.session_id,
            result["pseudocode"], 
            result["code_outputs"]
        )
        
        # Create result object
        processing_result = ProcessingResult(
            session_id=request.session_id,
            input_type=request.input_type,
            pseudocode=result["pseudocode"],
            flowchart=result["flowchart"],
            code_outputs=result["code_outputs"],
            code_analysis=code_analysis
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

@api_router.post("/analyze-code")
async def analyze_code_only(request: ProcessingRequest):
    """Analyze existing code for complexity, optimization, and learning insights"""
    try:
        # Get analysis directly without full processing
        code_analysis = await analyze_code_with_ai(
            request.session_id,
            "", # No pseudocode for direct analysis
            {"python": request.content} # Use input as code
        )
        
        # Return analysis-only result
        return {
            "session_id": request.session_id,
            "input_type": "code_analysis",
            "code_analysis": code_analysis,
            "original_code": request.content
        }
        
    except Exception as e:
        logging.error(f"Error analyzing code: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/analyze-code-file")
async def analyze_code_file(
    file: UploadFile = File(...),
    session_id: str = Form(...)
):
    """Analyze uploaded code file"""
    try:
        # Read file content
        content = await file.read()
        code_content = content.decode('utf-8')
        
        # Create analysis request
        request = ProcessingRequest(
            session_id=session_id,
            input_type="code_analysis",
            content=code_content
        )
        
        # Analyze the code
        result = await analyze_code_only(request)
        return result
        
    except Exception as e:
        logging.error(f"Error analyzing code file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
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

@api_router.post("/coach")
async def coach_endpoint(request: dict):
    """Coach endpoint - alias for /chat"""
    return await chat_about_code(request)

@api_router.post("/chat")
async def chat_about_code(request: dict):
    """Interactive chat about code analysis or results with adaptive responses"""
    session_id = request.get('session_id')
    message = request.get('message')
    context = request.get('context', {})  # Contains code, analysis, etc.
    
    if not session_id or not message:
        raise HTTPException(status_code=400, detail="Session ID and message are required")
    
    try:
        # Get user profile for personalized responses
        profile = await get_user_profile(session_id)
        
        model = await get_gemini_model()
        
        # Build context-aware prompt with skill level adaptation
        context_prompt = ""
        if context.get('code'):
            context_prompt += f"Code being discussed:\n{context['code']}\n\n"
        if context.get('analysis'):
            analysis = context['analysis']
            context_prompt += "Previous Analysis:\n"
            context_prompt += f"- Time Complexity: {analysis.get('time_complexity', 'N/A')}\n"
            context_prompt += f"- Space Complexity: {analysis.get('space_complexity', 'N/A')}\n"
            context_prompt += f"- Quality Score: {analysis.get('quality_score', 'N/A')}/10\n\n"
        
        # Adapt response based on skill level
        skill_instruction = {
            "beginner": "Explain concepts simply with basic examples and avoid complex jargon.",
            "intermediate": "Provide moderate detail with some technical terms and practical examples.", 
            "advanced": "Give comprehensive technical explanations with advanced concepts and optimizations."
        }.get(profile.skill_level, "Explain concepts clearly and appropriately.")
        
        # Create adaptive conversational prompt
        full_prompt = f"""You are an expert programming tutor having a conversation about code. 

User Skill Level: {profile.skill_level}
Instruction: {skill_instruction}

{context_prompt}User question: {message}

Provide a helpful, conversational response adapted to their skill level. Be specific about the code when relevant. Keep responses concise but informative."""

        response_obj = await asyncio.to_thread(model.generate_content, full_prompt)
        response = response_obj.text
        
        # Update interaction history
        interaction = {
            "message": message,
            "response_length": len(response),
            "timestamp": datetime.utcnow().isoformat(),
            "context_type": "analysis" if context.get('analysis') else "code" if context.get('code') else "general"
        }
        profile.interaction_history.append(interaction)
        await save_user_profile(profile)
        
        return {
            "session_id": session_id,
            "message": message,
            "response": response,
            "skill_level": profile.skill_level,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logging.error(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def analyze_user_skill_level(session_id: str, interaction_data: dict):
    """Analyze user's skill level based on interactions"""
    try:
        # Get user profile
        profile = await get_user_profile(session_id)
        
        # Analyze interaction complexity
        complexity_indicators = 0
        total_indicators = 0
        
        if interaction_data.get('code_quality_score'):
            total_indicators += 1
            if interaction_data['code_quality_score'] >= 8:
                complexity_indicators += 1
                
        if interaction_data.get('question_complexity'):
            total_indicators += 1
            advanced_keywords = ['optimization', 'algorithm', 'complexity', 'performance', 'scalability']
            if any(keyword in interaction_data.get('question', '').lower() for keyword in advanced_keywords):
                complexity_indicators += 1
        
        if interaction_data.get('code_patterns'):
            total_indicators += 1
            if any(pattern in ['recursion', 'dynamic_programming', 'graph_algorithms'] 
                   for pattern in interaction_data.get('code_patterns', [])):
                complexity_indicators += 1
        
        # Update skill level
        if total_indicators > 0:
            complexity_ratio = complexity_indicators / total_indicators
            if complexity_ratio >= 0.7:
                profile.skill_level = "advanced"
            elif complexity_ratio >= 0.4:
                profile.skill_level = "intermediate"
            else:
                profile.skill_level = "beginner"
        
        # Save updated profile
        await save_user_profile(profile)
        return profile.skill_level
        
    except Exception as e:
        logging.error(f"Error analyzing skill level: {str(e)}")
        return "beginner"  # Default fallback

async def get_user_profile(session_id: str) -> UserProfile:
    """Get or create user profile"""
    try:
        profile_data = await db.user_profiles.find_one({"session_id": session_id})
        if profile_data:
            return UserProfile(**profile_data)
        else:
            # Create new profile
            profile = UserProfile(session_id=session_id)
            await save_user_profile(profile)
            return profile
    except Exception as e:
        logging.error(f"Error getting user profile: {str(e)}")
        return UserProfile(session_id=session_id)

async def save_user_profile(profile: UserProfile):
    """Save user profile to database"""
    try:
        profile.last_updated = datetime.utcnow()
        await db.user_profiles.replace_one(
            {"session_id": profile.session_id},
            profile.dict(),
            upsert=True
        )
    except Exception as e:
        logging.error(f"Error saving user profile: {str(e)}")

async def generate_personalized_suggestions(session_id: str, current_topic: str):
    """Generate personalized learning suggestions"""
    try:
        profile = await get_user_profile(session_id)
        model = await get_gemini_model()
        
        suggestions_prompt = f"""Based on this user profile, generate 3 personalized learning suggestions for the topic "{current_topic}":

User Skill Level: {profile.skill_level}
Knowledge Gaps: {', '.join(profile.knowledge_gaps) if profile.knowledge_gaps else 'None identified yet'}
Completed Concepts: {', '.join(profile.completed_concepts) if profile.completed_concepts else 'None yet'}

Generate suggestions that:
1. Match their skill level
2. Address knowledge gaps
3. Build on completed concepts
4. Are practical and actionable

Format as JSON array: ["suggestion 1", "suggestion 2", "suggestion 3"]"""

        response_obj = await asyncio.to_thread(model.generate_content, suggestions_prompt)
        
        try:
            import json
            return json.loads(response_obj.text)
        except Exception:
            return [
                f"Practice more {current_topic} problems",
                f"Learn advanced {current_topic} techniques",
                f"Apply {current_topic} to real projects"
            ]
            
    except Exception as e:
        logging.error(f"Error generating suggestions: {str(e)}")
        return ["Keep practicing!", "Try more examples", "Ask questions"]

@api_router.post("/learning-profile")
async def update_learning_profile(request: dict):
    """Update user's learning profile and get personalized suggestions"""
    try:
        session_id = request.get('session_id')
        interaction_data = request.get('interaction_data', {})
        current_topic = request.get('topic', 'programming')
        
        if not session_id:
            raise HTTPException(status_code=400, detail="Session ID is required")
        
        # Analyze and update skill level
        skill_level = await analyze_user_skill_level(session_id, interaction_data)
        
        # Get updated profile
        profile = await get_user_profile(session_id)
        
        # Generate personalized suggestions
        suggestions = await generate_personalized_suggestions(session_id, current_topic)
        
        return {
            "session_id": session_id,
            "skill_level": skill_level,
            "personalized_suggestions": suggestions,
            "knowledge_gaps": profile.knowledge_gaps,
            "completed_concepts": profile.completed_concepts
        }
        
    except Exception as e:
        logging.error(f"Error updating learning profile: {str(e)}")
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