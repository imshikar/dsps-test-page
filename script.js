// Supabase client setup
const SUPABASE_URL = 'https://garioluglgeamsyfpptb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcmlvbHVnbGdlYW1zeWZwcHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwOTA2NTQsImV4cCI6MjA3ODY2NjY1NH0.NP_Bu4ch-ALFuThzQcUL5b6sOiWwhZ8Oz9D8naiH1M8';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('usernameInput');
    const messageInput = document.getElementById('messageInput');
    const messageForm = document.getElementById('messageForm');
    const messagesContainer = document.getElementById('messagesContainer');

    // Function to display a message
    function displayMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'mb-2 p-2 rounded-lg bg-blue-50 break-words'; // Added break-words for long messages
        messageElement.innerHTML = `
            <span class="font-semibold text-blue-700">${message.username}:</span>
            <span>${message.content}</span>
            <span class="text-xs text-gray-500 float-right">${new Date(message.created_at).toLocaleString()}</span>
        `;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to bottom

        // Remove the "no messages" placeholder if it exists
        const noMessagesPlaceholder = messagesContainer.querySelector('.text-gray-500');
        if (noMessagesPlaceholder) {
            noMessagesPlaceholder.remove();
        }
    }

    // Function to fetch existing messages
    async function fetchMessages() {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error.message);
        } else {
            data.forEach(displayMessage);
        }
    }

    // Function to set up real-time subscription
    function setupRealtime() {
        supabase
            .channel('messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                displayMessage(payload.new);
            })
            .subscribe();
    }

    // Handle form submission
    messageForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        const username = usernameInput.value.trim();
        const messageContent = messageInput.value.trim();

        if (!username) {
            alert('請輸入你的使用者名稱！');
            return;
        }

        if (!messageContent) {
            alert('訊息內容不能為空！');
            return;
        }

        // Insert the message into Supabase
        const { error } = await supabase
            .from('messages')
            .insert([{ username, content: messageContent }]);

        if (error) {
            console.error('Error inserting message:', error.message);
            alert('發送訊息失敗！');
        } else {
            // Message will be displayed via real-time subscription, so no need to display locally here
            // displayMessage(username, messageContent);
        }

        // Clear the message input
        messageInput.value = '';
    });

    // Initial setup
    fetchMessages();
    setupRealtime();
});
