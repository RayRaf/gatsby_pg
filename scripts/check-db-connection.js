// Script to check database connection and query registrations
const { Pool } = require('pg');

async function checkDatabase() {
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://gatsby_user:gatsby_password@localhost:5432/gatsby_db';
  
  console.log('🔍 Checking database connection...');
  console.log('📋 Database URL:', databaseUrl.replace(/:[^:@]+@/, ':****@'));
  
  const pool = new Pool({
    connectionString: databaseUrl,
    options: '-c search_path=public',
  });

  try {
    // Test basic connection
    console.log('\n✅ Testing connection...');
    const client = await pool.connect();
    console.log('✅ Connected successfully!');
    
    // Check current schema
    const schemaResult = await client.query('SHOW search_path');
    console.log('\n📂 Current search_path:', schemaResult.rows[0].search_path);
    
    // List all tables in public schema
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);
    console.log('\n📊 Tables in public schema:');
    tablesResult.rows.forEach(row => console.log('  -', row.tablename));
    
    // Count registrations
    const countResult = await client.query('SELECT COUNT(*) FROM public.registrations');
    console.log('\n👥 Total registrations:', countResult.rows[0].count);
    
    // Get first few registrations
    const dataResult = await client.query('SELECT id, name, drinks FROM public.registrations LIMIT 5');
    console.log('\n📝 Sample registrations:');
    dataResult.rows.forEach(row => {
      console.log(`  - ${row.name}: ${row.drinks.join(', ') || 'no drinks'}`);
    });
    
    client.release();
    console.log('\n✅ Database check completed successfully!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

checkDatabase();
