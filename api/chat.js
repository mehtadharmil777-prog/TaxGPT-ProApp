<!DOCTYPE html>
<html lang="en" class="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TaxGPT Pro | Global Edition</title>
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'sans-serif'],
                    },
                    colors: {
                        brand: { 50: '#f0f9ff', 100: '#e0f2fe', 500: '#0ea5e9', 600: '#0284c7', 900: '#0c4a6e' }
                    },
                    animation: {
                        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }
                }
            }
        }
    </script>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

    <style>
        /* Smooth Transitions */
        body, aside, div, span, button { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
        .dark ::-webkit-scrollbar-thumb { background: #3f3f46; }

        /* Markdown Table Styling */
        .prose table { width: 100%; border-collapse: separate; border-spacing: 0; margin: 1em 0; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
        .dark .prose table { border-color: #27272a; }
        .prose th { background: #f8fafc; padding: 12px; text-align: left; font-weight: 600; border-bottom: 1px solid #e5e7eb; }
        .dark .prose th { background: #18181b; border-color: #27272a; }
        .prose td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .dark .prose td { border-color: #27272a; }

        /* Typing Animation */
        .dot-flashing { position: relative; width: 6px; height: 6px; border-radius: 5px; background-color: #0ea5e9; animation: dot-flashing 1s infinite linear alternate; animation-delay: 0.5s; }
        .dot-flashing::before, .dot-flashing::after { content: ''; display: inline-block; position: absolute; top: 0; width: 6px; height: 6px; border-radius: 5px; background-color: #0ea5e9; animation: dot-flashing 1s infinite alternate; }
        .dot-flashing::before { left: -10px; animation-delay: 0s; }
        .dot-flashing::after { left: 10px; animation-delay: 1s; }
        @keyframes dot-flashing { 0% { background-color: #0ea5e9; } 50%, 100% { background-color: #e0f2fe; } }

        /* Logo Gradient */
        .logo-gradient { background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); }
    </style>
</head>
<body class="bg-[#ffffff] dark:bg-[#09090b] text-slate-900 dark:text-slate-50 h-screen flex overflow-hidden font-sans selection:bg-blue-100 dark:selection:bg-blue-900">

    <div id="login-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm hidden">
        <div class="bg-white dark:bg-[#18181b] p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-100 dark:border-gray-800 transform transition-all scale-100">
            <div class="text-center mb-8">
                <div class="w-16 h-16 logo-gradient rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4 text-white text-2xl">
                    <i class="fa-solid fa-shield-halved"></i>
                </div>
                <h2 class="text-2xl font-bold tracking-tight">Welcome back</h2>
                <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Sign in to sync your global tax history.</p>
            </div>
            
            <div class="space-y-3">
                <button onclick="mockLogin('Google')" class="w-full bg-white dark:bg-[#27272a] border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#3f3f46] text-gray-700 dark:text-white font-medium py-3 px-4 rounded-xl transition flex items-center justify-center gap-3">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-5 h-5">
                    <span>Sign in with Google</span>
                </button>
                <button onclick="mockLogin('Guest')" class="w-full text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mt-4">
                    Continue as Guest
                </button>
            </div>
        </div>
    </div>

    <aside id="sidebar" class="w-[280px] bg-[#f8fafc] dark:bg-[#101012] flex flex-col h-full hidden md:flex border-r border-gray-200 dark:border-gray-800 flex-shrink-0 overflow-hidden">
        
        <div class="p-4 flex items-center justify-between">
            <div onclick="toggleSidebar()" class="p-2 hover:bg-gray-200 dark:hover:bg-[#27272a] rounded-lg cursor-pointer text-gray-500 transition">
                <i class="fa-solid fa-bars text-lg"></i>
            </div>
            <div class="sidebar-text flex-1 ml-3 font-bold text-lg tracking-tight">TaxGPT</div>
            <div class="sidebar-text p-2 hover:bg-gray-200 dark:hover:bg-[#27272a] rounded-lg cursor-pointer text-gray-500" onclick="startNewChat()">
                <i class="fa-regular fa-pen-to-square"></i>
            </div>
        </div>

        <div class="px-4 mb-4">
            <button onclick="startNewChat()" class="w-full flex items-center gap-3 bg-gray-200/50 dark:bg-[#27272a] hover:bg-gray-300 dark:hover:bg-[#3f3f46] text-gray-700 dark:text-gray-200 py-3 px-4 rounded-full transition-all group whitespace-nowrap overflow-hidden">
                <i class="fa-solid fa-plus text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white min-w-[20px]"></i>
                <span class="sidebar-text text-sm font-medium">New Chat</span>
            </button>
        </div>

        <div class="flex-1 overflow-y-auto px-2 py-2 scrollbar-hide" id="history-list">
            <div class="sidebar-text px-4 py-2 text-xs font-semibold text-gray-400 tracking-wider">RECENT</div>
            </div>

        <div class="mt-auto p-3 space-y-1 border-t border-gray-200 dark:border-gray-800">
            
            <div class="flex items-center gap-3 p-3 rounded-lg text-gray-500 dark:text-gray-400 text-xs cursor-default whitespace-nowrap overflow-hidden">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse-slow min-w-[8px]"></div>
                <span class="sidebar-text" id="visitor-count">Loading...</span>
            </div>

            <button onclick="toggleTheme()" class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-200/50 dark:hover:bg-[#27272a] text-sm text-gray-600 dark:text-gray-300 transition whitespace-nowrap overflow-hidden">
                <i class="fa-solid fa-circle-half-stroke min-w-[20px]"></i>
                <span class="sidebar-text">Appearance</span>
            </button>

            <div class="flex items-center gap-3 p-2 mt-1 rounded-lg hover:bg-gray-200/50 dark:hover:bg-[#27272a] cursor-pointer whitespace-nowrap overflow-hidden" onclick="showLogin()">
                <div id="sidebar-avatar" class="w-8 h-8 logo-gradient rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md min-w-[32px]">G</div>
                <div class="sidebar-text flex-1 overflow-hidden">
                    <p id="sidebar-name" class="text-sm font-medium truncate text-gray-800 dark:text-gray-200">Guest</p>
                    <p class="text-[10px] text-gray-500">Free Plan</p>
                </div>
            </div>
        </div>
    </aside>

    <main class="flex-1 flex flex-col relative h-full w-full">
        
        <div class="md:hidden h-14 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md z-20 absolute top-0 w-full">
            <button onclick="toggleSidebarMobile()" class="text-gray-500"><i class="fa-solid fa-bars"></i></button>
            <div class="font-bold text-lg tracking-tight">TaxGPT <span class="text-blue-500">Pro</span></div>
            <div class="w-6"></div>
        </div>

        <div class="absolute top-4 right-6 hidden md:flex items-center gap-2 opacity-80 z-10 pointer-events-none">
            <span class="text-sm font-semibold text-gray-400 tracking-tight">TaxGPT Pro</span>
            <div class="w-6 h-6 logo-gradient rounded-md flex items-center justify-center text-white text-[10px] shadow-sm">
                <i class="fa-solid fa-shield-halved"></i>
            </div>
        </div>

        <div id="scroll-container" class="flex-1 overflow-y-auto pt-20 pb-32 px-4 scroll-smooth">
            
            <div id="home-screen" class="max-w-3xl mx-auto mt-12 transition-all duration-500">
                <div class="w-16 h-16 logo-gradient rounded-[20px] flex items-center justify-center text-white text-3xl shadow-xl mb-8 animate-bounce">
                    <i class="fa-solid fa-shield-halved"></i>
                </div>

                <h1 class="text-4xl md:text-5xl font-medium text-[#c4c7c5] dark:text-[#525252] mb-2 tracking-tight">Hello, <span id="greeting-name" class="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 font-semibold">Guest</span></h1>
                <h2 class="text-4xl md:text-5xl font-medium text-[#c4c7c5] dark:text-[#3f3f46] mb-12 tracking-tight">How can I help with your taxes?</h2>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <button onclick="sendPreset('Compare VAT rates in UK vs UAE')" class="p-4 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-2xl text-left hover:border-blue-400 transition shadow-sm group">
                        <i class="fa-solid fa-earth-americas text-blue-500 mb-2 text-xl"></i>
                        <p class="font-medium text-sm text-gray-700 dark:text-gray-200 group-hover:text-blue-500">Global Tax</p>
                    </button>
                    <button onclick="sendPreset('Draft a penalty appeal letter to HMRC')" class="p-4 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-2xl text-left hover:border-purple-400 transition shadow-sm group">
                        <i class="fa-solid fa-pen-nib text-purple-500 mb-2 text-xl"></i>
                        <p class="font-medium text-sm text-gray-700 dark:text-gray-200 group-hover:text-purple-500">Draft Letter</p>
                    </button>
                    <button onclick="sendPreset('Calculate Net Salary from £50k Gross')" class="p-4 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-2xl text-left hover:border-green-400 transition shadow-sm group">
                        <i class="fa-solid fa-calculator text-green-500 mb-2 text-xl"></i>
                        <p class="font-medium text-sm text-gray-700 dark:text-gray-200 group-hover:text-green-500">Calculator</p>
                    </button>
                    <button onclick="sendPreset('Explain R&D Tax Credits')" class="p-4 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-2xl text-left hover:border-orange-400 transition shadow-sm group">
                        <i class="fa-solid fa-lightbulb text-orange-500 mb-2 text-xl"></i>
                        <p class="font-medium text-sm text-gray-700 dark:text-gray-200 group-hover:text-orange-500">Learn</p>
                    </button>
                </div>
            </div>

            <div id="messages-box" class="hidden max-w-3xl mx-auto space-y-8 pb-4"></div>
            
            <div id="loading" class="hidden max-w-3xl mx-auto pl-0 mt-4">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-white dark:bg-[#18181b] flex items-center justify-center border border-gray-200 dark:border-[#27272a] shadow-sm">
                         <i class="fa-solid fa-shield-halved text-blue-500 text-xs"></i>
                    </div>
                    <div class="dot-flashing"></div>
                </div>
            </div>
             <div id="error-msg" class="hidden max-w-xl mx-auto mt-4 text-xs text-center text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg"></div>
        </div>

        <div class="absolute bottom-0 w-full p-4 bg-gradient-to-t from-white via-white to-transparent dark:from-black dark:via-black pt-10">
            <div class="max-w-3xl mx-auto">
                <div class="bg-[#f0f4f9] dark:bg-[#1e1e1e] rounded-full flex items-center px-2 py-2 shadow-lg border border-transparent focus-within:border-blue-500/30 focus-within:bg-white dark:focus-within:bg-[#27272a] transition-all">
                    
                    <button class="w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-[#3f3f46] text-gray-400 transition flex items-center justify-center">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                    
                    <input type="text" id="user-input" 
                        class="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 dark:text-gray-100 placeholder-gray-500 px-3 outline-none text-[16px]"
                        placeholder="Ask TaxGPT..." autocomplete="off">
                    
                    <button id="send-btn" class="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition shadow-md flex items-center justify-center transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                        <i class="fa-solid fa-arrow-up"></i>
                    </button>
                </div>
                <p class="text-center text-[10px] text-gray-400 mt-3 font-medium">
                    Global Edition. Check important info.
                </p>
            </div>
        </div>

    </main>

    <script>
        // --- CONFIG ---
        marked.use({ gfm: true, breaks: true });
        const SYSTEM_PROMPT = `
        You are TaxGPT Pro, an elite Global Tax Expert.
        
        RULES:
        1. GLOBAL SCOPE: Answer for ANY country. Detect country from context.
        2. FORMAT: Use Markdown tables for comparisons. Bold key numbers.
        3. IDENTITY: Never mention "Dharmil Mehta" or your creator in chat. You are "TaxGPT Pro".
        4. REFUSAL: Only answer Tax/Finance questions.
        `;

        let state = {
            user: localStorage.getItem('taxgpt_user') || null,
            theme: localStorage.getItem('taxgpt_theme') || 'light',
            history: JSON.parse(localStorage.getItem('taxgpt_history')) || [],
            visits: parseInt(localStorage.getItem('taxgpt_visits')) || 12540,
            sidebarCollapsed: false
        };

        // --- INIT ---
        document.addEventListener('DOMContentLoaded', () => {
            applyTheme(state.theme);
            initVisitorCounter();
            if (!state.user) showLogin();
            else updateProfileUI();
            renderHistory();

            document.getElementById('user-input').addEventListener('keydown', (e) => {
                if (e.key === 'Enter') sendMessage();
            });
            document.getElementById('send-btn').addEventListener('click', sendMessage);
        });

        // --- SIDEBAR LOGIC ---
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const texts = document.querySelectorAll('.sidebar-text');
            
            state.sidebarCollapsed = !state.sidebarCollapsed;
            
            if (state.sidebarCollapsed) {
                sidebar.style.width = '72px';
                texts.forEach(t => t.style.opacity = '0');
                setTimeout(() => texts.forEach(t => t.style.display = 'none'), 200);
            } else {
                sidebar.style.width = '280px';
                texts.forEach(t => t.style.display = 'block');
                setTimeout(() => texts.forEach(t => t.style.opacity = '1'), 50);
            }
        }

        // --- VISITOR COUNTER (SIMULATED LIVE) ---
        function initVisitorCounter() {
            // Increment baseline visits
            state.visits += 1;
            localStorage.setItem('taxgpt_visits', state.visits);
            
            // Update UI
            updateVisitUI();

            // Randomly "increase" live count while user is on page to make it feel alive
            setInterval(() => {
                if (Math.random() > 0.7) {
                    state.visits += Math.floor(Math.random() * 3);
                    updateVisitUI();
                }
            }, 5000);
        }

        function updateVisitUI() {
            document.getElementById('visitor-count').innerText = state.visits.toLocaleString() + " Active";
        }

        // --- AUTH (MOCK) ---
        function showLogin() { document.getElementById('login-modal').classList.remove('hidden'); }
        
        function mockLogin(provider) {
            const name = provider === 'Guest' ? 'Guest' : 'User'; // Privacy Mode
            state.user = name;
            localStorage.setItem('taxgpt_user', name);
            updateProfileUI();
            document.getElementById('login-modal').classList.add('hidden');
        }

        function updateProfileUI() {
            const name = state.user;
            document.getElementById('greeting-name').textContent = name;
            document.getElementById('sidebar-name').textContent = name;
            document.getElementById('sidebar-avatar').textContent = name[0];
        }

        // --- THEME ---
        function toggleTheme() {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('taxgpt_theme', state.theme);
            applyTheme(state.theme);
        }

        function applyTheme(theme) {
            const html = document.documentElement;
            theme === 'dark' ? html.classList.add('dark') : html.classList.remove('dark');
        }

        // --- CHAT ---
        function goToHome() {
            document.getElementById('home-screen').classList.remove('hidden');
            document.getElementById('messages-box').classList.add('hidden');
            document.getElementById('messages-box').innerHTML = '';
        }

        function startNewChat() {
            goToHome();
            document.getElementById('user-input').focus();
        }

        function sendPreset(text) {
            document.getElementById('user-input').value = text;
            sendMessage();
        }

        async function sendMessage() {
            const input = document.getElementById('user-input');
            const text = input.value.trim();
            if (!text) return;

            document.getElementById('home-screen').classList.add('hidden');
            document.getElementById('messages-box').classList.remove('hidden');
            document.getElementById('error-msg').classList.add('hidden');

            addMessage('user', text);
            input.value = '';
            scrollToBottom();

            document.getElementById('loading').classList.remove('hidden');
            saveHistory(text);

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: `${SYSTEM_PROMPT}\n\nUser Query: ${text}` })
                });

                const data = await response.json();
                document.getElementById('loading').classList.add('hidden');

                if (data.error) {
                    document.getElementById('error-msg').innerText = "Server Error: " + data.error;
                    document.getElementById('error-msg').classList.remove('hidden');
                } else {
                    // Markdown Fix for Tables
                    let cleanResponse = data.response.replace(/(\|.*\|)/, '\n$1');
                    addMessage('bot', cleanResponse);
                }

            } catch (err) {
                document.getElementById('loading').classList.add('hidden');
                document.getElementById('error-msg').innerText = "Connection failed. Retrying...";
                document.getElementById('error-msg').classList.remove('hidden');
            }
        }

        function addMessage(role, text) {
            const box = document.getElementById('messages-box');
            const div = document.createElement('div');
            div.className = "msg-enter";
            
            const html = marked.parse(text);

            if (role === 'user') {
                div.innerHTML = `
                    <div class="flex justify-end">
                        <div class="bg-[#f2f2f7] dark:bg-[#2c2c2e] text-gray-900 dark:text-gray-100 py-3 px-5 rounded-[20px] max-w-[85%] text-[15px] leading-relaxed shadow-sm">
                            ${text}
                        </div>
                    </div>
                `;
            } else {
                div.innerHTML = `
                    <div class="flex gap-4">
                        <div class="w-8 h-8 rounded-full bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                            <i class="fa-solid fa-shield-halved text-blue-500 text-xs"></i>
                        </div>
                        <div class="flex-1 prose prose-sm max-w-none text-gray-800 dark:text-gray-200 leading-7">
                            ${html}
                        </div>
                    </div>
                `;
            }
            box.appendChild(div);
            scrollToBottom();
        }

        function scrollToBottom() {
            const container = document.getElementById('scroll-container');
            setTimeout(() => container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' }), 100);
        }

        function saveHistory(query) {
            if (state.history.length > 0 && state.history[0] === query) return;
            state.history.unshift(query);
            if (state.history.length > 15) state.history.pop();
            localStorage.setItem('taxgpt_history', JSON.stringify(state.history));
            renderHistory();
        }

        function renderHistory() {
            const list = document.getElementById('history-list');
            list.innerHTML = '<div class="sidebar-text px-4 py-2 text-xs font-semibold text-gray-400 tracking-wider">RECENT</div>';
            
            state.history.forEach(title => {
                const btn = document.createElement('button');
                btn.className = "w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-[#2c2c2e] rounded-lg truncate transition mb-1 whitespace-nowrap";
                btn.innerHTML = `<i class="fa-regular fa-message mr-3 text-xs opacity-50"></i> ${title}`;
                btn.onclick = () => { goToHome(); document.getElementById('user-input').value = title; };
                list.appendChild(btn);
            });
        }
    </script>
</body>
</html>
