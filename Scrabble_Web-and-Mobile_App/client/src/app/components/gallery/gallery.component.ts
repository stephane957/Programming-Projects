import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxGalleryAnimation, NgxGalleryComponent, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { Avatar, AvatarInterfaceResponse } from '@app/classes/avatar.interface';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-gallery',
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {
    @ViewChild(NgxGalleryComponent) ngxGalleryComponent: NgxGalleryComponent;

    galleryOptions: NgxGalleryOptions[];
    galleryImages: NgxGalleryImage[];
    avatars: Avatar[] = [];
    serverUrl = environment.serverUrl;

    constructor(private http: HttpClient) {}

    async ngOnInit() {
        this.http.get<AvatarInterfaceResponse>(this.serverUrl + 'avatar').subscribe((res: AvatarInterfaceResponse) => {
            this.avatars = res.data;
            this.galleryOptions = [
                {
                    width: '300px',
                    height: '400px',
                    imageAnimation: NgxGalleryAnimation.Slide,
                    image: true,
                    fullWidth: false,
                    preview: false,
                    thumbnailsColumns: 4,
                    thumbnailsRows: 2,
                    thumbnailsMargin: 5,
                    thumbnailsPercent: 75,
                    imagePercent: 125,
                },
            ];
            this.galleryImages = [
                {
                    small: this.avatars[0].uri,
                    medium: this.avatars[0].uri,
                },
                {
                    small: this.avatars[1].uri,
                    medium: this.avatars[1].uri,
                },
                {
                    small: this.avatars[2].uri,
                    medium: this.avatars[2].uri,
                },
                {
                    small: this.avatars[3].uri,
                    medium: this.avatars[3].uri,
                },
                {
                    small: this.avatars[4].uri,
                    medium: this.avatars[4].uri,
                },
                {
                    small: this.avatars[5].uri,
                    medium: this.avatars[5].uri,
                },
                {
                    small: this.avatars[6].uri,
                    medium: this.avatars[6].uri,
                },
                {
                    small: this.avatars[7].uri,
                    medium: this.avatars[7].uri,
                },
            ];
        });
    }
}
