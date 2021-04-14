let getHomepage = (req, res) => {
    return res.json({message: "Hello World"});
};

module.exports = {
    getHomepage: getHomepage
};