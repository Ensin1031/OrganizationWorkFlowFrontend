import { Component, HostBinding, inject } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="not-found-container">
      <div class="content">
        <h1>404</h1>
        <h2>Страница не найдена</h2>
        <p>К сожалению, запрашиваемая страница не существует или была перемещена.</p>

        <div class="button-group">
          <button class="back-button" (click)="goBack()">← Вернуться назад</button>
          <a routerLink="/home" class="home-link">Перейти на главную</a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .not-found-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        background: var(--light-gray-background-color);
        margin: 0;
        padding: 20px;
      }
      .content {
        text-align: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 40px 60px;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        max-width: 500px;
      }
      h1 {
        font-size: 120px;
        margin: 0;
        color: #ffffff;
        font-weight: bold;
        line-height: 1;
      }
      h2 {
        font-size: 28px;
        margin: 20px 0 10px;
        color: #ffffff;
      }
      p {
        color: #f0f0f0;
        margin-bottom: 30px;
      }
      .button-group {
        display: flex;
        gap: 15px;
        justify-content: center;
        flex-wrap: wrap;
      }
      .back-button,
      .home-link {
        display: inline-block;
        padding: 10px 24px;
        border-radius: 8px;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 16px;
        font-weight: 500;
        border: none;
      }
      .back-button {
        background: rgba(255, 255, 255, 0.9);
        color: #667eea;
      }
      .back-button:hover {
        background: #ffffff;
        transform: translateY(-2px);
      }
      .home-link {
        background: #ffffff;
        color: #667eea;
      }
      .home-link:hover {
        background: #f8f9ff;
        transform: translateY(-2px);
      }
    `,
  ],
})
export class NotFoundComponent {
  @HostBinding('class') class = 'h-100 take-full-page-height';
  private location = inject(Location);

  goBack(): void {
    this.location.back();
  }
}
