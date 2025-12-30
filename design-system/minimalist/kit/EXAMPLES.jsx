/**
 * Design System Examples
 * Copy and adapt these components to match the Code Genie design style
 */

// ============================================
// MAIN CONTAINER
// ============================================
export const MainContainer = ({ children }) => (
  <div className="min-h-screen text-white font-mono" style={{backgroundColor: '#09090b'}}>
    <div className="max-w-7xl mx-auto p-8">
      {children}
    </div>
  </div>
);

// ============================================
// HEADER WITH TABS
// ============================================
export const HeaderWithTabs = ({ title, tabs, activeTab, onTabChange }) => (
  <div className="text-center mb-16">
    <h1 className="text-4xl font-light tracking-[0.3em] mb-4">
      {title}
    </h1>
    
    <div className="flex justify-center items-center space-x-12 mt-12 mb-16">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`text-xl font-light tracking-wide transition-all duration-300 ${
            activeTab === tab.id 
              ? 'border-b-2 border-zinc-50 pb-1'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  </div>
);

// ============================================
// SECTION LABEL
// ============================================
export const SectionLabel = ({ children }) => (
  <div className="text-zinc-400 text-sm font-light tracking-wider">
    {children}
  </div>
);

// ============================================
// BUTTONS
// ============================================
export const PrimaryButton = ({ children, onClick, disabled, loading }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className="w-full py-3 border border-zinc-800 hover:border-zinc-600 
               disabled:border-zinc-900 disabled:text-zinc-600 
               transition-colors text-sm font-light tracking-wider"
  >
    {loading ? 'loading...' : children}
  </button>
);

export const SecondaryButton = ({ children, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="py-2 px-6 border border-zinc-800 hover:border-zinc-600 
               disabled:border-zinc-900 disabled:text-zinc-600 
               transition-colors text-sm font-light tracking-wider"
  >
    {children}
  </button>
);

// ============================================
// INPUT FIELDS
// ============================================
export const TextInput = ({ value, onChange, placeholder, ...props }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full bg-transparent border border-zinc-800 
               focus:border-zinc-600 outline-none p-3 text-sm"
    {...props}
  />
);

export const TextArea = ({ value, onChange, placeholder, rows = 10, ...props }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className="w-full bg-transparent border border-zinc-800 
               focus:border-zinc-600 outline-none p-6 text-sm 
               leading-relaxed resize-none"
    {...props}
  />
);

export const CodeEditor = ({ value, onChange, placeholder, ...props }) => (
  <div className="relative">
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full h-96 bg-transparent border border-zinc-800 
                 focus:border-zinc-600 outline-none p-6 text-sm 
                 leading-relaxed resize-none font-mono"
      {...props}
    />
    {value && (
      <div className="absolute bottom-4 right-4 text-xs text-zinc-600">
        ✎ edit
      </div>
    )}
  </div>
);

// ============================================
// SELECT DROPDOWN
// ============================================
export const Select = ({ value, onChange, options, ...props }) => (
  <select
    value={value}
    onChange={onChange}
    className="w-full bg-transparent border border-zinc-800 
               focus:border-zinc-600 outline-none p-3 text-sm"
    {...props}
  >
    {options.map(option => (
      <option key={option.value} value={option.value} className="bg-zinc-950">
        {option.label}
      </option>
    ))}
  </select>
);

// ============================================
// TWO COLUMN LAYOUT
// ============================================
export const TwoColumnLayout = ({ left, right }) => (
  <div className="grid grid-cols-2 gap-16">
    <div className="space-y-6">
      {left}
    </div>
    <div className="space-y-6">
      {right}
    </div>
  </div>
);

// ============================================
// INFO ROW (Key-Value Display)
// ============================================
export const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-zinc-900">
    <span className="text-zinc-400 text-sm">{label}</span>
    <span className="text-zinc-50 font-light">{value}</span>
  </div>
);

// ============================================
// PROGRESS BAR
// ============================================
export const ProgressBar = ({ value, max = 10, showLabel = true }) => (
  <div className="flex justify-between items-center py-2 border-b border-zinc-900">
    <span className="text-zinc-400 text-sm">progress</span>
    <div className="flex items-center space-x-2">
      <div className="w-20 h-1 bg-zinc-800">
        <div 
          className="h-full bg-zinc-50" 
          style={{width: `${(value / max) * 100}%`}}
        ></div>
      </div>
      {showLabel && (
        <span className="text-zinc-50 text-sm">{value}/{max}</span>
      )}
    </div>
  </div>
);

// ============================================
// LIST ITEMS
// ============================================
export const BulletList = ({ items }) => (
  <div className="space-y-3">
    <div className="text-zinc-400 text-sm">items:</div>
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="text-sm text-zinc-300">
          • {item}
        </div>
      ))}
    </div>
  </div>
);

// ============================================
// MODAL/DIALOG
// ============================================
export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="rounded-xl p-6 w-full max-w-md mx-4" style={{backgroundColor: '#18181b'}}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-light text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ============================================
// CHAT CONTAINER
// ============================================
export const ChatContainer = ({ messages, onSend, inputValue, onInputChange, disabled }) => (
  <div className="space-y-6">
    <SectionLabel>CHAT</SectionLabel>
    
    <div className="border border-zinc-800 h-80 p-4 space-y-4 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="text-zinc-600 text-sm font-light">
          start conversation
        </div>
      ) : (
        messages.map((msg, i) => (
          <div key={i} className={`text-sm ${
            msg.type === 'user' ? 'text-zinc-50' : 
            msg.type === 'error' ? 'text-zinc-500' : 'text-zinc-300'
          }`}>
            {msg.type === 'user' ? '> ' : ''}
            {msg.content}
          </div>
        ))
      )}
    </div>
    
    <div className="flex space-x-2">
      <input
        type="text"
        value={inputValue}
        onChange={onInputChange}
        onKeyPress={(e) => e.key === 'Enter' && onSend()}
        placeholder="type message"
        className="flex-1 bg-transparent border border-zinc-800 
                   focus:border-zinc-600 outline-none p-3 text-sm"
      />
      <button
        onClick={onSend}
        disabled={disabled || !inputValue.trim()}
        className="px-6 py-3 border border-zinc-800 hover:border-zinc-600 
                   disabled:border-zinc-900 disabled:text-zinc-600 
                   transition-colors text-sm"
      >
        send
      </button>
    </div>
  </div>
);

// ============================================
// ERROR MESSAGE
// ============================================
export const ErrorMessage = ({ message, onClose }) => (
  <div className="fixed bottom-8 right-8 bg-zinc-900 border border-zinc-700 p-4 text-sm text-zinc-300">
    {message}
    {onClose && (
      <button onClick={onClose} className="ml-4 text-zinc-500 hover:text-zinc-300">
        ✕
      </button>
    )}
  </div>
);

// ============================================
// EMPTY STATE
// ============================================
export const EmptyState = ({ message, actionLabel, onAction }) => (
  <div className="space-y-4">
    <div className="text-zinc-600 text-sm font-light">
      {message}
    </div>
    {onAction && (
      <button 
        onClick={onAction}
        className="py-2 px-6 border border-zinc-800 hover:border-zinc-600 
                   transition-colors text-sm font-light tracking-wider"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

// ============================================
// LINK BUTTON
// ============================================
export const LinkButton = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="text-xs text-zinc-500 hover:text-zinc-300 tracking-wide"
  >
    {children}
  </button>
);
