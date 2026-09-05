frontend/
├── src/
│   ├── api/
│   │   └── axios.js           # base axios instance with baseURL
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── BlogCard.jsx
│   │   └── PrivateRoute.jsx   # for future protected routes
│   ├── pages/
│   │   ├── Home.jsx           # public blog list
│   │   ├── BlogDetail.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── CreateBlog.jsx
│   │   └── EditBlog.jsx
│   ├── context/
│   │   └── AuthContext.jsx    # store user + token globally
│   ├── hooks/
│   │   └── useAuth.js
│   ├── App.jsx
│   └── main.jsx
├── .env
└── package.json