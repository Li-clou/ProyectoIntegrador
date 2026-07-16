import dotenv from 'dotenv';
dotenv.config();

export const{
    PORT= 3000,
    SALT_ROUNDS=10,//produccion 10 y test 1
    GOOGLE_CLIENT_ID,
}= process.env;