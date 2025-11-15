# Page snapshot

```yaml
- generic [ref=e3]:
  - button "Sign in with GitHub" [ref=e6]:
    - img [ref=e7]
    - generic [ref=e8]: Sign in with GitHub
  - generic [ref=e9]:
    - separator [ref=e10]: or
    - generic [ref=e11]:
      - generic [ref=e12]: Email
      - textbox "Email" [active] [ref=e13]:
        - /placeholder: email@example.com
      - button "Sign in with Email" [ref=e14]
    - separator [ref=e15]: or
  - generic [ref=e17]:
    - generic [ref=e18]:
      - generic [ref=e19]: Email
      - textbox "Email" [ref=e20]:
        - /placeholder: ""
    - generic [ref=e21]:
      - generic [ref=e22]: Password
      - textbox "Password" [ref=e23]:
        - /placeholder: ""
    - button "Sign in with Credentials" [ref=e24]
```