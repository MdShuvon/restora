const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const root = __dirname;
const port = process.env.PORT || 3000;

const menu = [
  { id: 1, name: 'Grilled Chicken', price: 18.5 },
  { id: 2, name: 'Sharma Burger', price: 14.75 },
  { id: 3, name: 'Crispy Fries', price: 6.5 },
  { id: 4, name: 'Fresh Salad', price: 9.25 }
];

let orders = [
  {
    id: 1,
    customer_name: 'Ariana Khan',
    item_name: 'Grilled Chicken',
    quantity: 2,
    unit_price: 18.5,
    table_number: 'Table 5',
    notes: 'Extra spicy',
    status: 'ready',
    source: 'customer',
    created_at: new Date().toISOString(),
    rating: 5
  },
  {
    id: 2,
    customer_name: 'Nabil',
    item_name: 'Sharma Burger',
    quantity: 3,
    unit_price: 14.75,
    table_number: 'Table 2',
    notes: 'No onions',
    status: 'pending',
    source: 'customer',
    created_at: new Date(Date.now() - 900000).toISOString(),
    rating: 4
  }
];

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(payload));
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8'
  };

  return types[ext] || 'application/octet-stream';
}

function serveStaticFile(res, filePath) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    res.writeHead(200, {
      'Content-Type': getMimeType(filePath),
      'Cache-Control': 'no-store'
    });
    res.end(content);
  });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Request too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (pathname === '/api/menu' && req.method === 'GET') {
    sendJson(res, 200, menu);
    return;
  }

  if (pathname === '/api/menu' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const name = String(body.name || '').trim();
      const price = Number(body.price);

      if (!name || Number.isNaN(price) || price < 0) {
        sendJson(res, 400, { error: 'Valid name and price are required.' });
        return;
      }

      const newItem = {
        id: Date.now(),
        name,
        price
      };

      menu.push(newItem);
      sendJson(res, 201, newItem);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Invalid menu payload.' });
    }
    return;
  }

  if (pathname.startsWith('/api/menu') && req.method === 'DELETE') {
    const itemId = Number(url.searchParams.get('id'));
    const index = menu.findIndex((item) => item.id === itemId);

    if (index === -1) {
      sendJson(res, 404, { error: 'Menu item not found.' });
      return;
    }

    menu.splice(index, 1);
    sendJson(res, 200, { deleted: true });
    return;
  }

  if (pathname === '/api/orders' && req.method === 'GET') {
    sendJson(res, 200, orders);
    return;
  }

  if (pathname === '/api/orders' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const customerName = String(body.customerName || '').trim();
      const itemName = String(body.itemName || '').trim();
      const tableNumber = String(body.tableNumber || '').trim();
      const quantity = Number(body.quantity);
      const unitPrice = Number(body.unitPrice);
      const notes = String(body.notes || '').trim();
      const status = String(body.status || 'pending').trim();
      const source = String(body.source || 'customer').trim();

      if (!customerName || !itemName || !tableNumber || !Number.isInteger(quantity) || quantity <= 0) {
        sendJson(res, 400, { error: 'Customer name, item, table, and quantity are required.' });
        return;
      }

      if (Number.isNaN(unitPrice) || unitPrice < 0) {
        sendJson(res, 400, { error: 'Unit price must be valid.' });
        return;
      }

      const newOrder = {
        id: Date.now(),
        customer_name: customerName,
        item_name: itemName,
        quantity,
        unit_price: unitPrice,
        table_number: tableNumber,
        notes,
        status,
        source,
        created_at: new Date().toISOString(),
        rating: 5
      };

      orders.unshift(newOrder);
      sendJson(res, 201, newOrder);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Invalid order payload.' });
    }
    return;
  }

  if (pathname.startsWith('/api/orders') && req.method === 'DELETE') {
    const orderId = Number(url.searchParams.get('id'));
    const index = orders.findIndex((order) => order.id === orderId);

    if (index === -1) {
      sendJson(res, 404, { error: 'Order not found.' });
      return;
    }

    orders.splice(index, 1);
    sendJson(res, 200, { deleted: true });
    return;
  }

  if (pathname.startsWith('/api/orders') && req.method === 'PATCH') {
    try {
      const orderId = Number(url.searchParams.get('id'));
      const body = await parseBody(req);
      const nextStatus = String(body.status || '').trim();

      if (!Number.isInteger(orderId) || orderId <= 0 || !nextStatus) {
        sendJson(res, 400, { error: 'Valid order id and status required.' });
        return;
      }

      const order = orders.find((item) => item.id === orderId);
      if (!order) {
        sendJson(res, 404, { error: 'Order not found.' });
        return;
      }

      order.status = nextStatus;
      sendJson(res, 200, order);
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Invalid patch payload.' });
    }
    return;
  }

  let filePath = pathname === '/' ? '/index.html' : pathname;
  const safePath = path.normalize(root + filePath);

  if (!safePath.startsWith(root)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  if (fs.existsSync(safePath) && fs.statSync(safePath).isFile()) {
    serveStaticFile(res, safePath);
    return;
  }

  if (pathname === '/restaurant.html' || pathname === '/customer.html' || pathname === '/index.html') {
    serveStaticFile(res, path.join(root, pathname));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(port, () => {
  console.log(`Local server running at http://localhost:${port}`);
});
