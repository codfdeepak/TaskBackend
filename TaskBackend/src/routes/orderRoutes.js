const router = require('express').Router();
const controller = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(controller.listMine).post(controller.create);
router.get('/:id', controller.getMine);
module.exports = router;
