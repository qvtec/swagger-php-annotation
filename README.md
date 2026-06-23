# swagger-php-annotation

[![Version](https://badgen.net/vs-marketplace/v/qvtec3.swagger-php-annotation)](https://marketplace.visualstudio.com/items?itemName=qvtec3.swagger-php-annotation)
[![Installs](https://badgen.net/vs-marketplace/i/qvtec3.swagger-php-annotation)](https://marketplace.visualstudio.com/items?itemName=qvtec3.swagger-php-annotation)
[![Stars](https://img.shields.io/github/stars/qvtec/swagger-php-annotation?style=flat)](https://github.com/qvtec/swagger-php-annotation/stargazers)
[![License](https://img.shields.io/github/license/qvtec/swagger-php-annotation?style=flat)](https://github.com/qvtec/swagger-php-annotation/blob/main/LICENSE)


Swagger-PHP v3.x Annotation extension for VS Code.

## Features

* Completion snippet after `/**` above a Restful API function (ex. index, store, show, update, destroy)
* Completion of OpenAPI httpMethod (ex. `Get`, `Post`, `Put`, `Delete`)
* Completion of OpenAPI tags (ex. `Parameter`, `Response`, `JsonContent`, `Schema`, `Items`, `Property`, `RequestBody`)
* Add indent when pressing enter
* Decorator of swagger-php annotation

![features](https://github.com/qvtec/swagger-php-annotation/blob/main/assets/features.gif?raw=true)

## Requirements

This extension has no dependencies.

## Extension Settings

* `completions.type`: set `OA` (OpenAPI 3.x) or `SWG` (Swagger 2.x)

``` json
"completions.type": "OA"
```

* `decorator.regexes`: set to decoration types

``` json
"(?:\\* )(@OA\\\\\\w+)": {
    "decorationType": {
        "light": { "color": "#cb85cc" },
        "dark": { "color": "#cb85cc" }
    }
},
"(?:\\* \\s+)(@OA\\\\\\w+)": {
    "decorationType": {
        "light": { "color": "#6c83bd" },
        "dark": { "color": "#6c83bd" }
    }
},
"(?:\\*\\s+)(\\w+)(?:=)": {
    "decorationType": {
        "light": { "color": "#998554" },
        "dark": { "color": "#998554" }
    }
}
```

See [CHANGELOG](CHANGELOG.md) for release history.
