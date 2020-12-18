import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {CameraService} from '../camera.service';
import { AuthenticationService } from '../shared/authentication.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
	form:FormGroup
	imagePath = '/assets/cactus.png'
	imageStatus = false
	imageBlob
	errorMessage = ''
	constructor(private cameraSvc: CameraService, private fb:FormBuilder, 
		private authService: AuthenticationService, private router:Router) { }

	ngOnInit(): void {
	  if (this.cameraSvc.hasImage()) {
		  const img = this.cameraSvc.getImage()
		  this.imagePath = img.imageAsDataUrl
		  this.imageBlob = img.imageData
		  this.imageStatus = true
	  }
	  this.form = this.fb.group({
		  comments:this.fb.control('',[Validators.required]),
		  title: this.fb.control('',[Validators.required]),
	  })
	}
	async post(){
		const form = new FormData()
		form.set('title',this.form.get('title').value)
		form.set('comments',this.form.get('comments').value)
		form.set('image',this.imageBlob)
		console.log(form.get('title'))
		console.log(form.get('comments'))
		console.log(form.get('image'))
		this.authService.post(form)
			.subscribe(
				(res)=>{
					if(res.status===200){
						console.log('insertedId',res.body['id'])
						this.clear()
					}
				},(err)=>{
					if(err.status===401){
						this.router.navigate(['/'])
					}
					else{
						console.log(err)
						this.errorMessage = err.error.error
					}
				}
			)
	}

	clear() {
		this.imagePath = '/assets/cactus.png'
		this.imageStatus = false
		this.form.reset()
	}
}
