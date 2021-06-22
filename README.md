# swagger-php-annotation README

Swagger-PHP v3.x Annotation extension.

## Features

* Completion snippet after /** above a Restful API function (ex. index, store, show, update, destroy)
* Completion of OpenAPI httpMethod (ex. 'Get','Post','Put','Delete')
* Completion of OpenAPI tags (ex. 'Parameter','Response','JsonContent','Schema','Items','Property','RequestBody')
* Add indent when pressing enter
* Decorator of swagger-php annotation

## Requirements

This extension has no dependencies.

## Extension Settings

* `decorator.regexes`: set to decoration types

``` json
"(// )(@\\w+)": {
    "decorationType": {
        "borderWidth": "1px",
        "borderStyle": "solid",
        "overviewRulerColor": "red",
        "backgroundColor": "grey",
        "light": {
            "color": "pink",
            "borderColor": "darkblue"
        },
        "dark": {
            "color": "lightyellow",
            "borderColor": "lightblue"
        },
        "fontWeight": "bold"
    }
},
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

### 1.0.0

Initial release.
