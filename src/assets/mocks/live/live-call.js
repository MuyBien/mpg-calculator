fetch("https://api.mpg.football/live", {
  method: "GET",
  headers: {
    accept: "application/json, text/plain, */*",
    "accept-language": "fr,en-GB;q=0.9,en;q=0.8,fr-FR;q=0.7,es-ES;q=0.6,es;q=0.5",
    authorization: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXJfNzAyNTkyIiwiY2hlY2siOiIzZTc5Y2JjZDZmODBhOWIyIiwiaWF0IjoxNjg2NzU3NDg3fQ.34j8gx7JNHH8hk0pBWB700oFUzsvQDRndoxanbI3t7g",
    "client-version": "3.0.4",
    language: "fr-FR",
    platform: "web",
    "sec-ch-ua": "\"Chromium\";v=\"116\", \"Not)A;Brand\";v=\"24\", \"Google Chrome\";v=\"116\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    Referer: "https://mpg.football/",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  },
  body: null,
});