const axios = require("axios");

const getStock = async (req, res) => {
  try {
    const { symbol } = req.params;

    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.STOCK_API_KEY}`
    );

    res.json(response.data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStock };