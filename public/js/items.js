
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/items');
        const items = await response.json();
        
        const itemsList = document.getElementById('items-list');
        
        if (items.length === 0) {
            itemsList.innerHTML = '<p>No items found.</p>';
            return;
        }
        
        const itemsHTML = items.map(item => `
            <div class="item">
                <h3>[ID: ${item.id}] ${item.name}</h3>
                <p>${item.description}</p>
            </div>
        `).join('');
        
        itemsList.innerHTML = itemsHTML;
    } catch (error) {
        console.error('Error fetching items:', error);
        const itemsList = document.getElementById('items-list');
        itemsList.innerHTML = '<p>Error loading items. Please try again later.</p>';
    }
});