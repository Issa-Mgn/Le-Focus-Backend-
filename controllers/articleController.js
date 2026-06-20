const supabase = require('../config/supabase');
const imagekit = require('../config/imagekit');
const cloudinary = require('../config/cloudinary');
const { v4: uuidv4 } = require('uuid');

// Helper to upload to ImageKit
const uploadToImageKit = async (fileBuffer, fileName) => {
    return new Promise((resolve, reject) => {
        imagekit.upload({
            file: fileBuffer,
            fileName: fileName,
            folder: '/le-focus/articles'
        }, (err, result) => {
            if (err) reject(err);
            else resolve(result.url);
        });
    });
};

// Helper to upload to Cloudinary
const uploadToCloudinary = async (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'raw', folder: 'le-focus/pdfs' },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );
        uploadStream.end(fileBuffer);
    });
};

exports.getAllArticles = async (req, res) => {
    const { category, page = 1, limit = 10 } = req.query;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    let query = supabase
        .from('articles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end);

    if (category) {
        query = query.eq('category', category);
    }

    const { data, count, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    res.json({ data, count, page, limit });
};

exports.getArticleById = async (req, res) => {
    const { id } = req.params;

    // Increment views
    // Note: Supabase doesn't have a direct atomic increment via JS client easily without RPC, 
    // but for simplicity we fetch, increment, update. 
    // Ideally, create a Postgres function called 'increment_views'.

    // For now, simple fetch:
    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return res.status(404).json({ error: 'Article not found' });

    // Asynchronously update views (don't wait for response)
    supabase.from('articles').update({ views: data.views + 1 }).eq('id', id).then();

    res.json(data);
};

exports.createArticle = async (req, res) => {
    try {
        const { title, slug, excerpt, content, category, author, is_featured } = req.body;
        let cover_image_url = null;
        let gallery_image_urls = [];
        let pdf_url = null;

        // Handle Cover Image
        if (req.files['cover_image']) {
            cover_image_url = await uploadToImageKit(
                req.files['cover_image'][0].buffer,
                `cover_${Date.now()}`
            );
        }

        // Handle Gallery Images
        if (req.files['gallery_images']) {
            // Valider qu'il y a entre 1 et 3 images
            if (req.files['gallery_images'].length < 1) {
                return res.status(400).json({ error: 'Au moins 1 image est requise.' });
            }
            if (req.files['gallery_images'].length > 3) {
                return res.status(400).json({ error: 'Maximum 3 images autorisées.' });
            }
            
            for (const file of req.files['gallery_images']) {
                const url = await uploadToImageKit(file.buffer, `gallery_${Date.now()}`);
                gallery_image_urls.push(url);
            }
        } else {
            return res.status(400).json({ error: 'Au moins 1 image est requise pour créer un article.' });
        }

        // Handle PDF
        if (req.files['pdf_file']) {
            pdf_url = await uploadToCloudinary(req.files['pdf_file'][0].buffer);
        }

        const { data, error } = await supabase
            .from('articles')
            .insert([{
                title,
                slug,
                excerpt,
                content,
                category,
                author,
                cover_image_url,
                gallery_image_urls,
                pdf_url,
                is_featured: is_featured === 'true' || is_featured === true
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateArticle = async (req, res) => {
    const { id } = req.params;

    // Start with text fields from body
    const updates = { ...req.body };

    // We explicitly remove file fields from 'updates' if they came in as text (e.g. "null" or "[object Object]") 
    // to prevent corrupting the DB with non-URL strings.
    delete updates.cover_image;
    delete updates.gallery_images;
    delete updates.pdf_file;

    try {
        // Handle Cover Image
        if (req.files && req.files['cover_image']) {
            updates.cover_image_url = await uploadToImageKit(
                req.files['cover_image'][0].buffer,
                `cover_${Date.now()}`
            );
        }

        // Handle Gallery Images
        // If new gallery images are uploaded, we replace the existing gallery.
        if (req.files && req.files['gallery_images']) {
            // Valider qu'il y a entre 1 et 3 images
            if (req.files['gallery_images'].length < 1) {
                return res.status(400).json({ error: 'Au moins 1 image est requise.' });
            }
            if (req.files['gallery_images'].length > 3) {
                return res.status(400).json({ error: 'Maximum 3 images autorisées.' });
            }
            
            const newGalleryUrls = [];
            for (const file of req.files['gallery_images']) {
                const url = await uploadToImageKit(file.buffer, `gallery_${Date.now()}`);
                newGalleryUrls.push(url);
            }
            updates.gallery_image_urls = newGalleryUrls;
        }

        // Handle PDF
        if (req.files && req.files['pdf_file']) {
            updates.pdf_url = await uploadToCloudinary(req.files['pdf_file'][0].buffer);
        }

        const { data, error } = await supabase
            .from('articles')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteArticle = async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Article deleted' });
};

exports.incrementDownloads = async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch current downloads
        const { data: article, error: fetchError } = await supabase
            .from('articles')
            .select('downloads')
            .eq('id', id)
            .single();

        if (fetchError) return res.status(404).json({ error: 'Article not found' });

        const newDownloads = (article.downloads || 0) + 1;

        const { data, error } = await supabase
            .from('articles')
            .update({ downloads: newDownloads })
            .eq('id', id)
            .select() // return updated record
            .single();

        if (error) throw error;

        res.json({ downloads: data.downloads });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
