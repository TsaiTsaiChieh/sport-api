function logout(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.clearCookie('__session');
    res.json({success: true});
}

module.exports = logout;