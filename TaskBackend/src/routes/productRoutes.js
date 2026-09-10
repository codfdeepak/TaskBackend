const router = require('express').Router();
const controller = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.route('/').get(controller.list).post(protect, controller.create);
router.route('/:id').get(controller.getOne).patch(protect, controller.update).delete(protect, controller.remove);
module.exports = router;
