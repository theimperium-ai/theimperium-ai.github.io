// ============= CONFIGURATION =============
const CONFIG = {
    GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE', // ← ضع مفتاحك هنا
    GEMINI_MODEL: 'gemini-1.5-flash',
};

// ============= NAVIGATION =============
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
}

function scrollTo(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(10, 10, 15, 0.98)';
    } else {
        navbar.style.background = 'rgba(10, 10, 15, 0.85)';
    }
});

// ============= STATS COUNTER =============
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const target = +stat.getAttribute('data-target');
        let count = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            count += increment;
            if (count >= target) {
                stat.textContent = target + (target === 99 ? '' : '+');
                clearInterval(timer);
            } else {
                stat.textContent = Math.ceil(count);
            }
        }, 30);
    });
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateStats();
            observer.disconnect();
        }
    });
});

const statsSection = document.querySelector('.hero-stats');
if (statsSection) observer.observe(statsSection);

// ============= LANGUAGE TOGGLE =============
let currentLang = 'ar';
function toggleLang() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.querySelector('.lang-switch').textContent = currentLang === 'ar' ? 'EN' : 'AR';
    alert(currentLang === 'ar' ? 'الموقع بالعربية' : 'Website in English (Coming Soon)');
}

// ============= ORDER SERVICE =============
function orderService(service) {
    document.getElementById('service').value = service;
    scrollTo('contact');
}

// ============= CONTACT FORM =============
function sendMessage(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const service = document.getElementById('service').value;
    const message = document.getElementById('message').value;
    
    // Save to localStorage (temporary)
    const orders = JSON.parse(localStorage.getItem('imperium_orders') || '[]');
    orders.push({
        name, email, service, message,
        date: new Date().toISOString()
    });
    localStorage.setItem('imperium_orders', JSON.stringify(orders));
    
    // WhatsApp/Email integration
    const whatsappMsg = `طلب جديد من The Imperium AI:%0A%0Aالاسم: ${name}%0Aالإيميل: ${email}%0Aالخدمة: ${service}%0Aالرسالة: ${message}`;
    
    alert('✅ تم إرسال طلبك بنجاح!\nسنتواصل معك خلال 24 ساعة 👑');
    event.target.reset();
}

// ============= AI CHATBOT =============
function toggleChat() {
    const chatbot = document.getElementById('chatbot');
    chatbot.classList.toggle('active');
}

function openChat() {
    document.getElementById('chatbot').classList.add('active');
}

function handleKeyPress(event) {
    if (event.key === 'Enter') sendChatMessage();
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    input.value = '';
    
    showTyping();
    
    try {
        const response = await callGeminiAI(message);
        hideTyping();
        addMessage(response, 'bot');
    } catch (error) {
        hideTyping();
        addMessage('عذراً، حدث خطأ. حاول مرة أخرى أو تواصل معنا مباشرة.', 'bot');
        console.error(error);
    }
}

function addMessage(text, sender) {
    const messages = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.innerHTML = `
        <div class="message-avatar">${sender === 'bot' ? '👑' : '👤'}</div>
        <div class="message-content">${text}</div>
    `;
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
}

function showTyping() {
    const messages = document.getElementById('chatMessages');
    const typing = document.createElement('div');
    typing.className = 'message bot';
    typing.id = 'typingIndicator';
    typing.innerHTML = `
        <div class="message-avatar">👑</div>
        <div class="message-content">جاري التفكير... ⚡</div>
    `;
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
}

function hideTyping() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
}

async function callGeminiAI(userMessage) {
    const systemPrompt = `أنت مساعد ذكي لشركة "The Imperium AI" - إمبراطورية الذكاء الاصطناعي.
    
    خدماتنا:
    - AI Chatbots (روبوتات محادثة ذكية)
    - Automation (أتمتة المهام)
    - AI Agents (وكلاء ذكاء اصطناعي)
    - AI Consulting (استشارات)
    - AI Websites (مواقع ذكية)
    - AI Analytics (تحليلات ذكية)
    
    قواعد:
    1. رد دائماً بالعربية الفصحى المبسطة
    2. كن محترفاً وودوداً
    3. استخدم emoji مناسبة
    4. اقترح الخدمة المناسبة للعميل
    5. اطلب تواصله إذا أراد التفاصيل
    6. ردودك قصيرة ومختصرة (3-4 جمل كحد أقصى)
    
    رسالة العميل: ${userMessage}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: systemPrompt }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 300,
            }
        })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]) {
        return data.candidates[0].content.parts[0].text;
    }
    
    throw new Error('No response from AI');
}

// ============= INIT =============
console.log('%c👑 THE IMPERIUM AI', 'font-size: 24px; color: #d4af37; font-weight: bold;');
console.log('%cBuilding the Future of AI', 'color: #9b30ff; font-style: italic;');
