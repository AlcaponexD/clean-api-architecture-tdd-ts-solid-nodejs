import { HttpResponse } from "../protocols/http"
import { ServerError } from "../protocols/ServerError"
export const badRequest = (error): HttpResponse => ({
    statusCode : 400,
    body: error  
})

export const serverError = (): HttpResponse => ({
    statusCode : 500,
    body: new ServerError  
})

export const ok = (data: any): HttpResponse => ({
    statusCode : 200,
    body: data  
})