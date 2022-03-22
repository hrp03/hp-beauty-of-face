import { Component } from '@angular/core';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  phi: number = 0;

  uploadImage() {
    let fileElement = document.createElement('input');
    fileElement.type = 'file';
    fileElement.click();
    fileElement.onchange = this.readFile.bind(this);
  }

  readFile(file: any) {
    var reader = new FileReader();

    reader.onload = (e: any) => {
      var image = new Image();

      image.onload = () => {
        let canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        let context = canvas.getContext('2d');
        context?.drawImage(image, 0, 0);

        this.detectPoints(canvas);
      };

      image.src = e.target.result;
    };

    reader.readAsDataURL(file.target.files[0]);
  }

  detectPoints(canvas: any) {
    let image = canvas.toDataURL();

    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('assets/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('assets/models'),
    ]).then(async () => {
      let imageSize = { width: canvas.width, height: canvas.height };

      // faceapi.matchDimensions(canvas, imageSize);

      const results: any = await faceapi
        .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      if (!results || !results.landmarks) {
        alert("Try with different image");
      }else{
        this.drawPoints(image, results.landmarks._positions);
        this.calculate(results.landmarks._positions);
      }
    });
  }

  drawPoints(base64: any, points: any) {
    var image = new Image();

    image.onload = () => {
      let canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      let context = canvas.getContext('2d');

      if (context) {
        context.drawImage(image, 0, 0, image.width, image.height);

        let length = points.length;

        for (let i = 0; i < length; i++) {
          context.beginPath();
          context.arc(points[i].x, points[i].y, 1, 0, 2 * Math.PI);
          context.fillText('' + i, points[i].x, points[i].y);
          context.stroke();
        }
      }

      // document.body.append(canvas);
    };

    image.src = base64;
  }

  calculate(points: any) {
    let nose = this.getDistance(points[27], points[57]);
    let chin = this.getDistance(points[57], points[8]);

    this.phi = nose / chin;
    if (nose / chin === 1.618) {
      console.log('You are beautiful');
    }
  }

  getDistance(point1: any, point2: any) {
    let d = (point2._x - point1._x) ^ (2 + (point2._y - point1._y)) ^ 2;
    return d < 0 ? 0 : Math.sqrt(d);
  }
}
