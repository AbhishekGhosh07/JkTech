import { apiMethod } from "../common/api-constants";
import { apiResponse } from "../common/api-response";
import { Dao } from "../dao/dataAccessLayer";
import { Constant } from "../utils/constants";
import validate from '../utils/payload-validator';
import { addUserRules } from "../utils/payload-rules";
import Crypto from "crypto";
const jwt = require('jsonwebtoken');
require('dotenv').config();


export class AddUserService {
    public insert = async (req: {}, event: {}, context: {}) => {
        try {
            let response: any;
            validate({ event }, addUserRules);
            const objDao = new Dao();
            let result;
            const checkResponse = await objDao.checkUser(event);
            if (checkResponse.rowCount > 0) {
                result = 'User already Exists. Please Login with your credentials.';
            }
            else {
                const dbResponse = await objDao.addUser(event);
                console.log('dbResponse', dbResponse);
                if (dbResponse.rowCount > 0) {
                
                    const token = jwt.sign({ event }, Constant.secretKey, { expiresIn: '1h' });
                    result = {
                        token: token,
                        response: 'User Added'
                    }
                }
                else {
                    result = 'User not Added';
                }
            }
            if (result) {
                response = apiResponse(event, context, result, apiMethod.POST, false, '');
            }
            console.log('response', response);
            return response;
        }
        catch (error) {
            const message = 'error';
            apiResponse(event, context, {}, apiMethod.POST, true, message);
            return error;
        }
        return true;
    }
}