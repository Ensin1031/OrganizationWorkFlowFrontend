# OrganizationWorkflowFrontend

Клиентская часть системы **Organization Workflow**, построенная на [Angular 21](https://angular.io/).  
Адаптивное веб-приложение для управления организационными процессами.

## Разворачивание проекта

1.  Клонируем репозиторий
    ```shell
    git clone https://github.com/Ensin1031/OrganizationWorkFlowFrontend.git
    ```
2.  Переходим в папку проекта
    ```shell
    cd ./OrganizationWorkFlowFrontend
    ```
3.  Устанавливаем (при необходимости) минимально необходимую версию ноды:
    ```shell
    # Установка nvm:
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    # Или через wget:
    wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    # После установки перезагрузите терминал или выполните:
    source ~/.bashrc
    ```
    Установка нужной версии Node.js:
    ```shell
    nvm install 22.11.0
    nvm use 22.11.0
    # Сделать эту версию используемой по умолчанию:
    nvm alias default 22.11.0
    # Проверьте:
    node --version   # ➜ v22.11.0
    npm --version    # ➜ 10.x или новее
    ```
4.  Установка (глобально, при необходимости) Angular CLI v21:
    ```shell
    npm install -g @angular/cli@21
    # Убедитесь, что установка прошла без ошибок:
    ng version  # Должны увидеть строку Angular CLI: 21.x.x
    ```
5.  Установка зависимостей. В корне проекта выполните:
    ```shell
    npm install
    # либо
    npm ci  # предпочтительнее, т.к. эта команда поставит зависимости точно по package-lock.json
    ```
6.  Запуск сервера
    ```shell
    ng serve
    # если требуется со сменой дефолтного (4200) порта:
    ng serve --port 4300
    ```

7. Запуск тестов
   ```bash
   ng test
   # выгрузить данные по результатам тестов в файл
   ng test --watch=false > test-results.txt
   # запуск с формированием .md файла для вставки в README.md
   npm run test:ci
   ```

   <details>
   <summary>Результаты выполнения тестов</summary>
  
    | Test                                                                                                                                             | Status |
    |--------------------------------------------------------------------------------------------------------------------------------------------------|--------|
    | ✓  organization-workflow-frontend  src/app/components/common/notifications-panel/notifications-panel.spec.ts (14 tests) 672ms                    | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/work-entity/user-table/user-table.spec.ts (1 test) 648ms                                   | PASS   |
    | ✓ should create  646ms                                                                                                                           | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/work-entity/sprint-page/sprint-page.spec.ts (1 test) 899ms                                 | PASS   |
    | ✓ should create  896ms                                                                                                                           | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/dialogs/create-update-project-version/create-update-project-version.spec.ts (1 test) 214ms | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/dialogs/create-update-work/create-update-work.spec.ts (1 test) 1143ms                      | PASS   |
    | ✓ should create  1139ms                                                                                                                          | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/dialogs/create-update-project/create-update-project.spec.ts (1 test) 1230ms                | PASS   |
    | ✓ should create  1228ms                                                                                                                          | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/dialogs/create-update-sprint/create-update-sprint.spec.ts (1 test) 227ms                   | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/dialogs/create-update-work-status/create-update-work-status.spec.ts (1 test) 164ms         | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/home/home.spec.ts (1 test) 383ms                                                           | PASS   |
    | ✓ should create  383ms                                                                                                                           | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/common/top-sidebar/top-sidebar.spec.ts (1 test) 171ms                                      | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/dialogs/change-task-sprint/change-task-sprint.spec.ts (1 test) 145ms                       | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/work-entity/search-page/search-page.spec.ts (25 tests) 2486ms                              | PASS   |
    | ✓ should create  426ms                                                                                                                           | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/dialogs/create-update-category/create-update-category.spec.ts (1 test) 115ms               | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/common/not-found/not-found.spec.ts (1 test) 58ms                                           | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/dialogs/create-update-reference/create-update-reference.spec.ts (1 test) 109ms             | PASS   |
    | ✓  organization-workflow-frontend  src/app/app.spec.ts (2 tests) 92ms                                                                            | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/common/login/login.spec.ts (2 tests) 92ms                                                  | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/dialogs/view-sprint-users-load/view-sprint-users-load.spec.ts (1 test) 54ms                | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/common/register/register.spec.ts (1 test) 36ms                                             | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/work-entity/tasks/by-sprints/by-sprints.spec.ts (1 test) 50ms                              | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/work-entity/project-page/project-page.spec.ts (1 test) 429ms                               | PASS   |
    | ✓ should create  418ms                                                                                                                           | PASS   |
    | ✓  organization-workflow-frontend  src/app/directives/duration-minutes.spec.ts (3 tests) 46ms                                                    | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/dialogs/alert/alert.spec.ts (1 test) 22ms                                                  | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/common/left-sidebar/left-sidebar.spec.ts (1 test) 49ms                                     | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/common/status-view/status-view.spec.ts (1 test) 12ms                                       | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/common/user-photo-view/user-photo-view.spec.ts (1 test) 16ms                               | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/common/safe-svg/safe-svg.spec.ts (1 test) 11ms                                             | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/dialogs/confirmation/confirmation.spec.ts (1 test) 29ms                                    | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/work-entity/tasks/tasks-list/tasks-list.spec.ts (1 test) 31ms                              | PASS   |
    | ✓  organization-workflow-frontend  src/app/services/user.spec.ts (1 test) 3ms                                                                    | PASS   |
    | ✓  organization-workflow-frontend  src/app/services/work.spec.ts (1 test) 3ms                                                                    | PASS   |
    | ✓  organization-workflow-frontend  src/app/services/auth.spec.ts (1 test) 3ms                                                                    | PASS   |
    | ✓  organization-workflow-frontend  src/app/services/sprint.spec.ts (1 test) 3ms                                                                  | PASS   |
    | ✓  organization-workflow-frontend  src/app/services/left-sidebar-width.spec.ts (1 test) 3ms                                                      | PASS   |
    | ✓  organization-workflow-frontend  src/app/services/project-context.spec.ts (1 test) 4ms                                                         | PASS   |
    | ✓  organization-workflow-frontend  src/app/services/global-search.spec.ts (1 test) 3ms                                                           | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/work-entity/tasks/sprint-card/sprint-card.spec.ts (20 tests) 1839ms                        | PASS   |
    | ✓ should create  512ms                                                                                                                           | PASS   |
    | ✓  organization-workflow-frontend  src/app/services/token.spec.ts (1 test) 2ms                                                                   | PASS   |
    | ✓  organization-workflow-frontend  src/app/services/work-connection.spec.ts (1 test) 6ms                                                         | PASS   |
    | ✓  organization-workflow-frontend  src/app/services/notifications.spec.ts (1 test) 8ms                                                           | PASS   |
    | ✓  organization-workflow-frontend  src/app/services/notifications-panel.spec.ts (1 test) 2ms                                                     | PASS   |
    | ✓  organization-workflow-frontend  src/app/services/work-comment.spec.ts (1 test) 3ms                                                            | PASS   |
    | ✓  organization-workflow-frontend  src/app/pipes/duration-humanize-pipe.spec.ts (1 test) 0ms                                                     | PASS   |
    | ✓  organization-workflow-frontend  src/app/interceptors/auth-interceptor.spec.ts (1 test) 1ms                                                    | PASS   |
    | ✓  organization-workflow-frontend  src/app/guards/auth-guard.spec.ts (1 test) 1ms                                                                | PASS   |
    | ✓  organization-workflow-frontend  src/app/guards/no-auth-guard.spec.ts (1 test) 0ms                                                             | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/work-entity/tasks/active-tasks-board/active-tasks-board.spec.ts (20 tests) 2668ms          | PASS   |
    | ✓ should create  589ms                                                                                                                           | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/work-entity/tasks/task-view/task-view.spec.ts (6 tests) 1832ms                             | PASS   |
    | ✓ should create  770ms                                                                                                                           | PASS   |
    | ✓ should load slug from route  328ms                                                                                                             | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/common/user-settings/user-settings.spec.ts (21 tests) 2759ms                               | PASS   |
    | ✓ should create  531ms                                                                                                                           | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/work-entity/tasks/tasks.spec.ts (1 test) 39ms                                              | PASS   |
    | ✓  organization-workflow-frontend  src/app/components/work-entity/projects/projects.spec.ts (5 tests) 2897ms                                     | PASS   |
    | ✓ should create  744ms                                                                                                                           | PASS   |
    | ✓ should display a list of projects in the table  1005ms                                                                                         | PASS   |
    | ✓ should display paginator with correct length  767ms                                                                                            | PASS   |

  </details>


## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
