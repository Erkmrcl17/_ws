import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application();

app.use((ctx) => {
  // ctx.response.status = 404
  console.log('url=', ctx.request.url)
  let pathname = ctx.request.url.pathname
  if (pathname == '/') {
    ctx.response.body = `
    <html>
    <body>
      <h1>自我介紹</h1><ol>
      <div class="card">
          <li><a href="/biodata">BIODATA</a></li>
          <li><a href="/education">EDUCATION</a></li>
          <li><a href="/favsong">FAV SONG</a></li>
      </div>
      </ol>
    </body>
    </html>
    `
    
  } else if (pathname == '/biodata'){
    ctx.response.body = `Hello, My name is ERIKA and my chinesse name is 李麗恩.`
  }
  else if (pathname == '/education'){
    ctx.response.body = "I'm an international student at National Quemoy University, majoring in Computer Science."
  }
  else if (pathname == '/favsong'){
    ctx.response.redirect("https://youtu.be/XaZJUMm81XA?si=aen85nBzyQ2Lcl1e")
  }
  else{
    
  }
  // ctx.response.body = 'Not Found!'
});

console.log('start at : http://127.0.0.1:8000')
await app.listen({ port: 8000 })