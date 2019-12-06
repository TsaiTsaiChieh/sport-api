function logout(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.clearCookie('__session');
    return res.json({success: true});
}

module.exports = logout;