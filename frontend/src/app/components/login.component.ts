import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import{ Router} from '@angular/router'
import {AuthenticationService} from '../shared/authentication.service'
import{UserDetails} from '../shared/model'
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form:FormGroup
  errorMessage = ''
  status:number

	constructor(private fb:FormBuilder, private authService: AuthenticationService, private router: Router) { }

	ngOnInit(): void {
    this.form = this.fb.group({
      username: this.fb.control('',[Validators.required]),
      password: this.fb.control('',[Validators.required])
    })
  }
  login(){
    const userDetails = this.form.value
    this.authService.login(userDetails).subscribe(
      resp=>{
          console.log(resp)
          // this.response = resp.body['message'][0]
          // this.statusCode = resp.status
          console.log(resp.body)
          
              this.status = resp.status
              this.authService.response = resp.body as UserDetails
              this.router.navigate(['/main'])
              // this.errorMessage = resp.statusText        
          // this.ok=resp.ok
          // console.log(typeof this.ok)
      },
      err=>{
          console.log(err)
          // this.statusCode = err.status
          // this.errMessage = err.error.err
          this.status= err.status
          this.errorMessage = err.error.err
      }
  )

  }
}
