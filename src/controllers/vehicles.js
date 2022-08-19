const methods = {};
const { validationResult } = require("express-validator");
const { queryInstance } = require("../db/connection");
const { dateDifference, currentDate } = require("..//helpers");

methods.getVehicles = async (req, res) => {
  try {
    const vehicles = await queryInstance('SELECT * from vehicles JOIN departments ON departments.dept_id = vehicles.dept_id');
    res.json({ vehicles });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send(err.message);
  }
};

methods.updateVehicles = async (req, res) => {
  try {
    const { vehicle_id, to_dept_id } = req.body;
    const vehicle = await queryInstance(`SELECT * from vehicles WHERE vehicle_id = '${vehicle_id}'`);
    const from_dept_id = vehicle[0].dept_id;
    const days = dateDifference(vehicle[0].date_in);
    await queryInstance(`UPDATE vehicles SET dept_id = '${to_dept_id}', date_in = '${currentDate}' WHERE vehicle_id = '${vehicle_id}'`);
    await queryInstance(`INSERT INTO summary (vehicle_id, from_dept_id, to_dept_id, days) VALUES ('${vehicle_id}', '${from_dept_id}', '${to_dept_id}', '${days}') RETURNING *`);
    await queryInstance(`INSERT INTO counts (dept_id, days) VALUES ('${from_dept_id}', '${days}') RETURNING *`);
    res.json({ result: "Vehile updated successfully!" });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send(err.message);
  }
};

methods.addVehicle = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { dept_id, stock, year, make, model, ucm_in, date_in } = req.body;

  try {
    const vehicles = await queryInstance(`INSERT INTO vehicles (dept_id, stock, year, make, model, ucm_in, date_in, variant, notes) VALUES ('${dept_id}', '${stock}', '${year}', '${make}', '${model}', '${ucm_in}', '${date_in}', 'Variant', 'Out with Driver') RETURNING *`);
    res.json({ vehicles });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send(err.message);
  }
};

methods.deleteVehicle = async (req, res) => {
  try {
    const vehicle_id = req.params.vehicle_id;
    const vehicles = await queryInstance(`DELETE FROM vehicles WHERE vehicle_id = '${vehicle_id}' RETURNING *`);
    res.json({ vehicles });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send(err.message);
  }
};

module.exports = methods;
