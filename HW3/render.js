function escapeHtml(html) {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function layout(title, content) {
  return `
    <html>
    <head>
      <title>${escapeHtml(title)}</title>
      <style>
        body {
          padding: 80px;
          font: 16px Helvetica, Arial;
          background-color: #f9f9f9;
        }

        h1 {
          font-size: 2em;
        }

        h2 {
          font-size: 1.2em;
        }

        #posts {
          margin: 0;
          padding: 0;
        }

        #posts li {
          margin: 40px 0;
          padding: 0;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
          list-style: none;
        }

        #posts li:last-child {
          border-bottom: none;
        }

        textarea {
          width: 500px;
          height: 300px;
        }

        input[type=text],
        textarea {
          border: 1px solid #eee;
          border-top-color: #ddd;
          border-left-color: #ddd;
          border-radius: 2px;
          padding: 15px;
          font-size: .8em;
        }

        input[type=text] {
          width: 500px;
        }

        input[type=submit] {
          padding: 10px 20px;
          border: none;
          background-color: #007BFF;
          color: white;
          border-radius: 4px;
          cursor: pointer;
        }

        input[type=submit]:hover {
          background-color: #0056b3;
        }
      </style>
    </head>
    <body>
      <section id="content">
        ${content}
      </section>
    </body>
    </html>
  `;
}

export function list(posts, user) {
  let list = posts.map(post => `
    <li>
      <h2>${escapeHtml(post.title)}</h2>
      <p><a href="/${user}/post/${post.id}">Read post</a></p>
    </li>
  `).join('\n');

  let content = `
    <h1>Posts</h1>
    <p>You have <strong>${posts.length}</strong> posts!</p>
    <p><a href="/${user}/post/new">Create a Post</a></p>
    <ul id="posts">
      ${list}
    </ul>
  `;
  return layout('Posts', content);
}

export function newPost(user) {
  return layout('New Post', `
    <h1>New Post</h1>
    <p>Create a new post.</p>
    <form action="/${user}/post" method="post">
      <p>
        <label for="title">Title:</label>
        <input type="text" placeholder="Title" name="title" id="title" required>
      </p>
      <p>
        <label for="body">Contents:</label>
        <textarea placeholder="Contents" name="body" id="body" required></textarea>
      </p>
      <p>
        <input type="submit" value="Create">
      </p>
    </form>
  `);
}

export function show(post, user) {
  return layout(escapeHtml(post.title), `
    <h1>${escapeHtml(post.title)}</h1>
    <p>${escapeHtml(post.body)}</p>
    <p><a href="/${user}/">Back to posts</a></p>
  `);
}
