const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const db = require('./database');
const items = require('./items'); 

const PORT = 3000;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'simple-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

function isAuthenticated(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login'); // if not authenticated, go to login, was also thinking of having another page that says you have to login first
    }
    // you SHALL pass >:)
    next(); 
}

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (users.length > 0) {
            req.session.user = users[0]; // Store user info in the session
            res.cookie('userName', users[0].name, { maxAge: 3600000}); 
            res.redirect('/dashboard');
        } else {
            res.send('Invalid username or password! :( <a href="/login">Click here to try again!</a>');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Database error.');
    }
});


app.get('/dashboard', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});


app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying the cookie >:( :', err);
            return res.status(500).send('Unable to log out');
        }
        res.clearCookie('connect.sid');
        res.clearCookie('userName'); // Clear the userName cookie
        res.redirect('/login');
    });
});


app.get('/create', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'create.html'));
});
// ok at this point i realize i should probably have a separate js file for handling item operations
app.post('/create', isAuthenticated, async (req, res) => {
    const { itemName, itemDescription } = req.body;
    try {
        await db.execute('INSERT INTO items (name, description) VALUES (?, ?)', [itemName, itemDescription]);
        res.redirect('/dashboard'); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to create new item.');
    }
});

app.get('/items', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'items.html'));
});

app.get('/api/items', isAuthenticated, async (req, res) => {
    try {
        const itemsData = await items.getAllItems();  
        res.json(itemsData);  
    } catch (error) {
        console.error(error);
        res.status(500).send('Database error.');
    }
});





app.get('/items/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    try {
        const item = await items.getItemById(id);
        res.render('item-detail', { item });
    } catch (error) {
        console.error(error);
        res.status(500).send('Database error.');
    }
});

app.get('/delete', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'delete-item.html'));
});

app.post('/delete', isAuthenticated, async (req, res) => {
    const { id } = req.body;
    try {
        await db.execute('DELETE FROM items WHERE id = ?', [id]);
        res.redirect('/dashboard'); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to delete item.');
    }
});

app.get('/update', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'update.html'));
});

app.post('/update', isAuthenticated, async (req, res) => {
    const { id, name, description } = req.body;

    try {
        const [result] = await db.execute('UPDATE items SET name = ?, description = ? WHERE id = ?', [name, description, id]);

        if (result.affectedRows > 0) {
            res.send(`Item with ID ${id} has been updated! <a href="/items">View Items</a>`);
        } else {
            res.send('Item not found. <a href="/update">Try again</a>');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to update item.');
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

