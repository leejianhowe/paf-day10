import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http'

import {UserDetails} from './model'

@Injectable()
export class AuthenticationService{
    statusCode:number
    ok:boolean=false
    errMessage:string=''
    response:UserDetails
    

    constructor(private http:HttpClient){
    }

    login(userDetails:UserDetails){
        return this.http.post('/login',userDetails,{observe: 'response'})
    }
    post(formData){
        const params = new HttpParams().set('username',this.response.user_id).set('password',this.response.password)
        return this.http.post('/post',formData,{params:params,observe:'response'})
    }
}