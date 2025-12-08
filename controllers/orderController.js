const supabase = require('../config/supabase');

exports.createOrder = async (req, res) => {
    try {
        const { type, client_info, details, total_price } = req.body;

        const { data, error } = await supabase
            .from('orders')
            .insert([{
                type,
                client_info, // Ensure this is passed as JSON object
                details,     // Ensure this is passed as JSON object
                total_price,
                status: 'pending'
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAllOrders = async (req, res) => {
    const { status } = req.query;

    let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

exports.updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
};
