# Pets 

I thought it would be useful to document how all of the pieces come together. Even though this is relatively striaghtforward, there are some moving parts so just wanted to make sure you're set up for success. 

### Client Side 

```shell
curl -X POST https://pets-production-d594.up.railway.app/pets \
   -H "Authorization: Bearer eyJhbGc..." \
   -H "Content-Type: application/json" \
   -d '{ "name": "Romeo" }'
```
### Server Side (how the request reaches the server)

```js
... express instance

app.use(cors())              // Allows cross-origin requests
app.use(express.json())     // Parses JSON body

app.use('/auth', authRoutes) // Auth endpoints
app.use('/pets', petRoutes)  // Pet endpoints (protected)

app.listen(process.env.PORT)
```

### Token Validation 

The auth middleware sits between the request and your route handler - it basically intercepts the request, checks if there's a valid token, and either lets it through or blocks it. 
When a token is valid, we attach the user info to the request object so later handlers know who's making the request. Right below is the middleware chain: 

```js
// Token check happens here first
router.post('/pets', authMiddleware, createPetHandler)
```

### Token Validation Steps:

```js
// Grab the token from the header
const authHeader = req.headers.authorization
// We just want the token, and we can return it with .split()
// split(' ') breaks the string into an array wherever there’s a space.
// For a Bearer token, that results in: ["Bearer", "eyJhbGciOi..."]
// [1] grabs the second element of that array — the actual token value — and ignores the "Bearer" part.
const token = authHeader.split(' ')[1]

// Verify it's legit using your secret
const decoded = jwt.verify(token, process.env.JWT_SECRET);
// decoded = { id: 1, email: "user@example.com", iat: 1234, exp: 5678 }

// 3. Store user info on the request
req.user = decoded;

// 4. Let the request continue
next();

If validation fails:
// No token? Bounce them
if (!token) {
   return res.status(401).json({ error: "No token provided" });
}

// Bad token? Also bounce / throws error if invalid/expired
jwt.verify(token, secret); 
```

### Prisma

Prisma is our ORM - it basically translates your JavaScript code into SQL queries so you don't have to write raw SQL. It reads your schema.prisma file to understand your database structure, then generates a type-safe client that you use to query the database. When you do something like `prisma.user.create()`, Prisma converts that into a SQL INSERT statement and sends it to your PostgreSQL database.

```js
// prisma/schema.prisma
model User {
   id        Int      @id @default(autoincrement())
   email     String   @unique
   password  String
   createdAt DateTime @default(now())
}

model Pet {
   id         Int      @id @default(autoincrement())
   name       String
   status     String
   categoryId Int
   category   Category @relation(fields: [categoryId], references: [id])
}
```

This is our source of truth - Prisma uses this to generate migrations and the client code.

### DB Client usage

Behind the scenes, Prisma takes these method calls and runs SQL like INSERT INTO users... or SELECT * FROM users WHERE...

```js
// In your route handlers
const prisma = require('./config/prisma');

// Create a user - Prisma converts this to SQL
const user = await prisma.user.create({
   data: {
   email: 'test@example.com',
   password: hashedPassword
   }
});

// Find a user
const user = await prisma.user.findUnique({
   where: { email: 'test@example.com' }
});

// Create a pet
const pet = await prisma.pet.create({
   data: {
     name: 'Buddy',
     status: 'available',
     categoryId: 1
   }
});
```

Prisma will always know the shape of your data

```js
// Prisma knows the shape of your data
const user = await prisma.user.create({
   data: {
     email: 'test@example.com',
     password: 'hash123',
     invalidField: 'oops'  // TypeScript error - field doesn't exist
   }
});
```



### Railway 

Railway will be our infrastructure provider. It builds our code from GitHub, provides environment variables like DATABASE_URL and PORT, and keeps everything running 24/7. You don't have to worry about servers, scaling, or SSL certificates - Railway handles all that.

### Environment Variables

These variable get injected at runtime, preventing hard coded secrets in your codebase. Because you know... the internet can sometimes be a mean place.

```js
process.env.DATABASE_URL  // Railway's PostgreSQL connection
process.env.JWT_SECRET    // We set this
process.env.PORT          // Railway assigns this
```

### In summary 

1. User sends request to create a pet
   POST /pets with Authorization header

2. Request → Railway → Express app

3. Middleware chain runs:
   - CORS 
   - express.json() for body parsing
   - authMiddleware validates JWT token

4. Route handler executes:
   router.post('/pets', authMiddleware, createPetHandler)

5. Inside createPetHandler:
   const pet = await prisma.pet.create({
      data: { name: req.body.name, ... }
   })

6. Prisma:
   - Reads DATABASE_URL from Railway env
   - Connects to Railway PostgreSQL
   - Converts JavaScript to SQL INSERT
   - Executes query
   - Returns the created pet object
     

## Bruno 

<img width="1512" height="945" alt="Screenshot 2025-12-30 at 5 51 34 PM" src="https://github.com/user-attachments/assets/4566acac-3107-44da-91e5-12cca6b5002e" />



