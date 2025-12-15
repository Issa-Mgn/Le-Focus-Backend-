const supabase = require('../config/supabase');

// Helper to build nested comments tree
const buildCommentTree = (comments) => {
    const commentMap = {};
    const roots = [];

    // First map all comments by ID and initialize replies
    comments.forEach(comment => {
        comment.replies = [];
        commentMap[comment.id] = comment;
    });

    // Then distribute into roots or replies
    comments.forEach(comment => {
        if (comment.parent_id) {
            if (commentMap[comment.parent_id]) {
                commentMap[comment.parent_id].replies.push(comment);
            }
        } else {
            roots.push(comment);
        }
    });

    return roots;
};

exports.getCommentsByArticle = async (req, res) => {
    const { articleId } = req.params;

    try {
        const { data: comments, error } = await supabase
            .from('comments')
            .select('*')
            .eq('article_id', articleId)
            .order('created_at', { ascending: true }); // Oldest first for chronological conversation

        if (error) throw error;

        // Transform into nested structure
        const structuredComments = buildCommentTree(comments);

        // Map to match the requested JSON format slightly better (renaming/formatting if needed)
        // Spec: { id, author, content, date, likes, replies }
        // DB columns are slightly different (author_name, created_at). I'll map them.
        const mapResponse = (c) => ({
            id: c.id,
            author: c.author_name,
            content: c.content,
            date: c.created_at,
            likes: c.likes,
            replies: c.replies.map(mapResponse)
        });

        res.json(structuredComments.map(mapResponse));

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.addComment = async (req, res) => {
    const { articleId } = req.params;
    const { email, content, author } = req.body; // author might be sent directly?

    // Logic: Extract name from email if author not provided
    let authorName = author;
    if (!authorName && email) {
        authorName = email.split('@')[0];
    }
    if (!authorName) authorName = 'Anonymous';

    try {
        const { data, error } = await supabase
            .from('comments')
            .insert([{
                article_id: articleId,
                author_name: authorName,
                email: email,
                content: content,
                likes: 0
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.likeComment = async (req, res) => {
    const { commentId } = req.params;

    try {
        // Fetch current likes
        const { data: comment, error: fetchError } = await supabase
            .from('comments')
            .select('likes')
            .eq('id', commentId)
            .single();

        if (fetchError) throw fetchError;

        const newLikes = (comment.likes || 0) + 1;

        const { data, error } = await supabase
            .from('comments')
            .update({ likes: newLikes })
            .eq('id', commentId)
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, likes: data.likes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.replyToComment = async (req, res) => {
    const { commentId } = req.params; // This is the parent_id
    const { email, content, author } = req.body;

    let authorName = author;
    if (!authorName && email) {
        authorName = email.split('@')[0];
    }
    if (!authorName) authorName = 'Anonymous';

    try {
        // First get article_id from parent comment to keep consistency
        const { data: parent, error: parentError } = await supabase
            .from('comments')
            .select('article_id')
            .eq('id', commentId)
            .single();

        if (parentError || !parent) return res.status(404).json({ error: 'Parent comment not found' });

        const { data, error } = await supabase
            .from('comments')
            .insert([{
                article_id: parent.article_id,
                parent_id: commentId,
                author_name: authorName,
                email: email,
                content: content,
                likes: 0
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
