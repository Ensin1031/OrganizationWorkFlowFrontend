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
