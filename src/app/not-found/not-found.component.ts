import { Router } from '@angular/router';
import { Component, OnInit, AfterViewInit, Renderer2, ElementRef } from '@angular/core';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent implements OnInit, AfterViewInit {
  constructor(
    private router: Router,
    private renderer: Renderer2,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    const ionContent = this.elementRef.nativeElement.querySelector('ion-content');
    if (ionContent) {
      this.renderer.setAttribute(ionContent, 'tabindex', '0');
      ionContent.focus();
    }
  }

  goToback() {
    this.router.navigate(['/home']);
  }
}