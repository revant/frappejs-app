module.exports = {
    "name": "OAuthClient",
    "doctype": "DocType",
    "isSingle": 0,
    "isChild": 0,
    "keywordFields": [
        "name",
        "app_name"
    ],
    "fields": [
        {
            "fieldname": "name",
            "label": "Client ID",
            "fieldtype": "Data"
        },
        {
            "fieldname": "clientSecret",
            "label": "Client Secret",
            "fieldtype": "Data"
        },
        {
            "fieldname": "appName",
            "label": "App Name",
            "fieldtype": "Data"
        },
        {
            "fieldname": "isTrusted",
            "label": "Trusted App",
            "fieldtype": "Check"
        }
    ]
}
