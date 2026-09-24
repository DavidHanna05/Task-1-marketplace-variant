import Joi from 'joi';
import { Listing } from '../models/Listing.js';

// TODO: write a validation schema for create/update per README.md section 2.
const createSchema = Joi.object({
  title: Joi.string().min(2).max(60).required(),
  price: Joi.number().min(0).required(),
  description: Joi.string().max(500),
  category: Joi.string().valid('textbooks', 'electronics', 'furniture', 'clothing', 'other'),
  condition: Joi.string().valid('new', 'like-new', 'used', 'worn'),
  status: Joi.string().valid('active', 'sold', 'removed'),
  seller: Joi.string().hex().length(24)
});
const updateSchema = Joi.object({
  title: Joi.string().min(2).max(60),
  price: Joi.number().min(0),
  description: Joi.string().max(500),
  category: Joi.string().valid('textbooks', 'electronics', 'furniture', 'clothing', 'other'),
  condition: Joi.string().valid('new', 'like-new', 'used', 'worn'),
  status: Joi.string().valid('active', 'sold', 'removed'),
  seller: Joi.string().hex().length(24)

});
function publicListing(l) {
  return { id: l._id.toString(), title: l.title, price: l.price, category:l.category,condition: l.condition,stats: l.status, seller: l.seller, createdAt: l.createdAt };
}
// GET /api/listings
// TODO: implement per README.md section 3.
export async function getAllListings(req, res, next) {
  try {
    const listings= await Listing.find().lean();
    res.json({Listings:listings.map(publicListing)})
    populate('seller');
  } catch (err) { next(err); }
}

// GET /api/listings/:id
// TODO: implement per README.md sections 3 and 5.
export async function getListing(req, res, next) {
  try {
    const listing =await Listing.findById(req.params.id)
    res.json({Listing: publicListing(listing)})
    populate('seller');
    
  } catch (err) { next(err); }
}

// POST /api/listings
// TODO: implement per README.md section 3.
export async function createListing(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });
    const listing = await Listing.create({ title: value.title, price: value.price, description: value.description, category: value.category, condition: value.condition, status: value.status, seller: value.seller });
    res.status(201).json({ listing: publicListing(listing) });
  } catch (err) { next(err); }
}

// PATCH /api/listings/:id
// TODO: implement per README.md sections 3 and 5.
export async function updateListing(req, res, next) {
  try {
    const { value, error } = updateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) return res.status(400).json({ message: error.message });
        const doc =await Listing.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Listing not found' });
        doc.set(value);
        await doc.save();
        res.json({ user: publicListing(doc) });
  } catch (err) { next(err); }
}

// DELETE /api/listings/:id
// TODO: implement per README.md sections 4 and 5.
export async function deleteListing(req, res, next) {
  try {
    const { value, error } = updateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) return res.status(400).json({ message: error.message });
        const doc =await Listing.findById(req.params.id);
        doc.status='removed';
        await doc.save();
        res.json({ user: publicListing(doc) });
  } catch (err) { next(err); }
}

export async function updateStatus(req, res, next) {
  try {
        const doc =await Listing.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Listing not found' });
        if(doc.status=='sold') return res.status(400).json({ message: 'Listing already sold' });
        doc.status='sold';
        await doc.save();
        res.json({ user: publicListing(doc) });
  } catch (err) { next(err); }
}
