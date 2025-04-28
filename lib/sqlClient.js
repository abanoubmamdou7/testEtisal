// /**
//  * QueryBuilder class for building SQL queries with a Supabase-like API
//  */
// class QueryBuilder {
//   constructor(tableName, client) {
//     this.tableName = tableName;
//     this.client = client;
//     this.resetQuery();
//   }

//   resetQuery() {
//     this._select = '*';
//     this._where = [];
//     this._whereParams = [];
//     this._orderBy = [];
//     this._limit = null;
//     this._offset = null;
//     return this;
//   }

//   select(columns) {
//     if (Array.isArray(columns)) {
//       this._select = columns.join(', ');
//     } else if (typeof columns === 'string') {
//       this._select = columns;
//     }
//     return this;
//   }

//   where(column, operator, value) {
//     if (value === undefined) {
//       value = operator;
//       operator = '=';
//     }
//     this._where.push(`${column} ${operator} @param${this._where.length + 1}`);
//     this._whereParams.push(value);
//     return this;
//   }

//   order(column, direction = 'asc') {
//     this._orderBy.push(`${column} ${direction.toUpperCase()}`);
//     return this;
//   }

//   limit(count) {
//     this._limit = count;
//     return this;
//   }

//   offset(count) {
//     this._offset = count;
//     return this;
//   }

//   async _buildAndExecuteQuery(additionalSQL = '') {
//     let query = `SELECT ${this._select} FROM ${this.tableName}`;
//     const params = [...this._whereParams];

//     if (this._where.length > 0) {
//       query += ` WHERE ${this._where.join(' AND ')}`;
//     }

//     if (this._orderBy.length > 0) {
//       query += ` ORDER BY ${this._orderBy.join(', ')}`;
//     }

//     if (this._limit !== null) {
//       query += ` OFFSET 0 ROWS FETCH NEXT ${this._limit} ROWS ONLY`;
//     }

//     query += additionalSQL;

//     const result = await this.client.query(query, params);
//     this.resetQuery();
//     return result;
//   }

//   async get() {
//     return this._buildAndExecuteQuery();
//   }

//   async single() {
//     const results = await this.limit(1).get();
//     return results.length > 0 ? results[0] : null;
//   }

//   async insert(data) {
//     try {
//       const columns = Object.keys(data);
//       const values = Object.values(data);
//       const placeholders = columns.map((_, index) => `@param${index + 1}`).join(', ');

//       const query = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;

//       const result = await this.client.query(query, values);
//       return {
//         ...data,
//         id: result.insertId || null
//       };
//     } catch (error) {
//       console.error('Insert error:', error);
//       throw error;
//     }
//   }

//   async update(data) {
//     if (this._where.length === 0) {
//       throw new Error('Update operation requires a where clause');
//     }

//     const setClause = Object.keys(data)
//       .map((key, idx) => `${key} = @paramSet${idx + 1}`)
//       .join(', ');

//     const params = [...Object.values(data), ...this._whereParams];

//     let query = `UPDATE ${this.tableName} SET ${setClause} WHERE ${this._where.join(' AND ')}`;

//     await this.client.query(query, params);

//     return this._buildAndExecuteQuery();
//   }

//   async delete() {
//     if (this._where.length === 0) {
//       throw new Error('Delete operation requires a where clause');
//     }

//     const query = `DELETE FROM ${this.tableName} WHERE ${this._where.join(' AND ')}`;
//     await this.client.query(query, this._whereParams);

//     return { success: true };
//   }
// }

// /**
//  * MSSQLClient class that mimics Supabase client API
//  */
// class MSSQLClient {
//   constructor(apiUrl) {
//     if (!apiUrl) {
//       console.warn('API URL not provided to MSSQLClient, using default: http://localhost:5000/api');
//     }
//     this.apiUrl = apiUrl || 'http://localhost:5000/api';
//   }

//   async query(query, params = []) {
//     try {
//       const response = await fetch(`${this.apiUrl}/query`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ query, params }),
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.error || 'Query failed');
//       }

//       return await response.json();
//     } catch (error) {
//       console.error('Query error:', error);
//       throw error;
//     }
//   }

//   table(tableName) {
//     return new QueryBuilder(tableName, this);
//   }

//   from(tableName) {
//     return this.table(tableName);
//   }
// }

// // Get API URL from environment variable or use default
// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// // Create and export a singleton instance of the client
// const mssqlClient = new MSSQLClient(API_URL);

// // Default export
// export default mssqlClient;

// // Named export
// export { mssqlClient };
