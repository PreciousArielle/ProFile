// auth-guard.js — include in every protected page
// <script src="auth-guard.js"></script> at the TOP of <body>

(function() {
  const token = localStorage.getItem('profile_token')
  const user  = localStorage.getItem('profile_user')
  if (!token || !user) {
    window.location.href = '/login.html'
    throw new Error('Not authenticated')
  }
  window._profileUser  = JSON.parse(user)
  window._profileToken = token
})()

async function logout() {
  try {
    await fetch('/auth/logout', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('profile_token') }
    })
  } catch(e) {}
  localStorage.removeItem('profile_token')
  localStorage.removeItem('profile_user')
  window.location.href = '/login.html'
}
