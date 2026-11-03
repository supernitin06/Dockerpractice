import pool from "../../../../redish/backend/config/db.js";

export const postinformation = async (data) => {
    const { name, email } = data;
    const query = `CREATE TABLE IF NOT EXISTS person (
    id serial primary key,
    name varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
    await pool.query(query);
    const queryInsert = "INSERT INTO person (name ,email,created_at,updated_at) values($1,$2,$3,$4)"
    const result = await pool.query(queryInsert,[name,email,new Date(),new Date()]);
    console.log(result);
    return result;
}


export const getinformation = async () => {
    const query = "SELECT * FROM person";
    const result = await pool.query(query);
    return result.rows;
}



export const updateinformation = async (data) => {
    const { name, email, id } = data;
    const query = "UPDATE person SET name = $1, email = $2 WHERE id = $3";
    const result = await pool.query(query,[name,email,id]);
    return result.rows;
}


export const deleteinformation = async (id) => {
    const query = "DELETE FROM person WHERE id = $1";
    const result = await pool.query(query,[id]);
    return result.rows;
}