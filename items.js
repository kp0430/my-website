const db = require('./database');   

// Get all items
const getAllItems = async () => {
    try {
        const [rows] = await db.execute('SELECT * FROM items');
        return rows;  // Return all the items from the database
    } catch (error) {
        console.error('Error fetching items:', error);
        throw new Error('Database error');
    }
};

// Create an item
const createItem = async (name, description) => {
    try {
        const [result] = await db.execute('INSERT INTO items (name, description) VALUES (?, ?)', [name, description]);
        return { id: result.insertId, name, description };  // Return the newly created item
    } catch (error) {
        console.error('Error creating item:', error);
        throw new Error('Database error');
    }
};

// Update an item by ID
async function updateItem(id, name, description) {
    const [result] = await db.query('UPDATE items SET name = ?, description = ? WHERE id = ?', [name, description, id]);
    if (result.affectedRows > 0) {
        return { id, name, description };
    }
    return null; 
}

// Delete an item by ID
async function deleteItem(id) {
    const [result] = await db.query('DELETE FROM items WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
        return true; 
    }
    return false; 
}


module.exports = { getAllItems, createItem, updateItem, deleteItem };
