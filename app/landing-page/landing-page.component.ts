import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  templateUrl:'./landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  ToSection(id:string){
    document.getElementById(id)?.scrollIntoView();
  }
}
const navbar = document.querySelector('#header')!;

window.addEventListener('scroll', () => {
  if (window.scrollY > 0) {
    if (navbar) {
      navbar.classList.add('header-scrolled');
    }
  } else {
    if (navbar) {
      navbar.classList.remove('header-scrolled');
    }
  }
});
