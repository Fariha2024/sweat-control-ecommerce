# src/utils/errors.js
cat > src/utils/errors.js << 'EOF'
class NotFoundError extends Error { constructor(message) { super(message); this.name = 'NotFoundError'; this.type = 'NotFoundError'; this.statusCode = 404; } }
class ValidationError extends Error { constructor(message) { super(message); this.name = 'ValidationError'; this.type = 'ValidationError'; this.statusCode = 400; } }
class DatabaseError extends Error { constructor(message) { super(message); this.name = 'DatabaseError'; this.type = 'DatabaseError'; this.statusCode = 500; } }
module.exports = { NotFoundError, ValidationError, DatabaseError };
EOF