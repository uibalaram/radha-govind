import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useNavigate } from 'react-router-dom'
import radha from './assets/radha.png'
import jsPDF from "jspdf";

const Invoice = () => {
    const [customer, setCustomer] = useState({
        name: "",
        contact: "",
        alternateContact: "",
        address: "",
    });
    const [items, setItems] = useState([
        {
            itemName: "",
            goldRate: 0,
            netWeight: 0,
            grossWeight: 0,
            makingCharge: 0,
            additionalCost: 0,
            total: 0,
            calculatedGoldPrice: 0
        },
    ]);

    const [oldGoldItems, setOldGoldItems] = useState([
        { slNo: 1, itemName: "", goldRate: 0, weight: 0, tunchPercentage: 100, total: 0 },
    ]);

    const [summary, setSummary] = useState({
        purchaseGold: 0,
        sellGold: 0,
        tax: 0,
        finalTotal: 0,
    });

    const [invoiceNumber, setInvoiceNumber] = useState(null);
    const [isOldGoldOpen, setIsOldGoldOpen] = useState(false);
    const currentDate = new Date().toLocaleDateString(); // Current Date

    // Generate Invoice Number
    useEffect(() => {
        const generatedInvoiceNumber = Math.floor(Math.random() * 1000000);
        setInvoiceNumber(generatedInvoiceNumber);
    }, []);

    // Update customer details
    const handleCustomerChange = (e) => {
        const { name, value } = e.target;
        setCustomer((prev) => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...items];
    
        // Update the field value
        updatedItems[index][field] =
            ["goldRate", "netWeight", "grossWeight", "makingCharge", "additionalCost", "makingChargePerGram"].includes(field)
                ? +value
                : value;
    
        // Calculate the calculatedGoldPrice (Gold Rate * Net Weight)
        updatedItems[index].calculatedGoldPrice = updatedItems[index].goldRate * updatedItems[index].netWeight;
    
        // Calculate the making charge if 'makingChargePerGram' is updated
        if (field === "makingChargePerGram") {
            updatedItems[index].makingCharge = updatedItems[index].makingChargePerGram * updatedItems[index].netWeight;
        }
    
        // Calculate the total for the item
        updatedItems[index].total =
            updatedItems[index].calculatedGoldPrice +
            updatedItems[index].makingCharge +
            updatedItems[index].additionalCost;
    
        // Update state and summary
        setItems(updatedItems);
        updateSummary(updatedItems, oldGoldItems);
    };
    



    // Handle old gold item changes
    const handleOldGoldChange = (index, field, value) => {
        const updatedOldGoldItems = [...oldGoldItems];
        updatedOldGoldItems[index][field] =
            field === "tunchPercentage" || field === "weight" || field === "goldRate" ? +value : value;

        // Calculate the total for old gold based on effective weight
        const effectiveWeight =
            (updatedOldGoldItems[index].weight * updatedOldGoldItems[index].tunchPercentage) / 100;
        updatedOldGoldItems[index].total = updatedOldGoldItems[index].goldRate * effectiveWeight;

        setOldGoldItems(updatedOldGoldItems);
        updateSummary(items, updatedOldGoldItems);
    };

    // Add new row for old gold item
    const addOldGoldRow = () => {
        setOldGoldItems((prev) => [
            ...prev,
            { slNo: prev.length + 1, itemName: "", goldRate: 0, weight: 0, tunchPercentage: 100, total: 0 },
        ]);
    };

    // Add a new row for new gold items
    const addItemRow = () => {
        setItems((prev) => [
            ...prev,
            {
                itemName: "",
                goldRate: 0,
                netWeight: 0,
                grossWeight: 0,
                makingCharge: 0,
                additionalCost: 0,
                total: 0,
            },
        ]);
    };

    const [cgst, setCgst] = useState(0); // CGST (default 0)
    const [sgst, setSgst] = useState(0); // SGST (default 0)


    const updateSummary = (items, oldGoldItems) => {
        const purchaseGold = items.reduce((acc, item) => acc + item.total, 0);
        const sellGold = oldGoldItems.reduce((acc, item) => acc + item.total, 0);
        const cgstAmount = cgst > 0 ? purchaseGold * (cgst / 100) : 0; // CGST calculation
        const sgstAmount = sgst > 0 ? purchaseGold * (sgst / 100) : 0; // SGST calculation

        const totalWithTax = purchaseGold + cgstAmount + sgstAmount; // Total with tax
        const finalTotal = totalWithTax - sellGold; // Final total subtracting sellGold

        setSummary({
            purchaseGold,
            sellGold,
            cgst: cgstAmount,
            sgst: sgstAmount,
            totalWithTax, // Store this separately
            finalTotal,   // Final amount displayed
        });
    };

    useEffect(() => {
        updateSummary(items, oldGoldItems);
    }, [items, oldGoldItems, cgst, sgst]);



    // Toggle Old Gold Section
    const toggleOldGoldSection = () => {
        setIsOldGoldOpen((prev) => !prev);
    };

    // Generate Bill (for demo purposes)


    // const generateBill = () => {
    //     const doc = new jsPDF();

    //     const x1 = 10;  // X position for the Invoice Number
    //     const x2 = 150; // X position for the Date (adjust based on your page width)

    //     doc.text(`Invoice Number: ${invoiceNumber}`, x1, 10);
    //     doc.text(`Date: ${currentDate}`, x2, 10);

    //     doc.text("Customer Details:", 10, 30);
    //     doc.text(`Name: ${customer.name}`, 10, 40);
    //     doc.text(`Contact: ${customer.contact}`, 10, 50);
    //     doc.text(`Alternate Contact: ${customer.alternateContact}`, 10, 60);
    //     doc.text(`Address: ${customer.address}`, 10, 70);

    //     doc.text("New Gold Purchase:", 10, 80);
    //     items.forEach((item, index) => {
    //         doc.text(
    //             `Item ${index + 1}: ${item.itemName}, Gold Rate: ${item.goldRate}, Net Weight: ${item.netWeight
    //             }, Gross Weight: ${item.grossWeight}, Making Charge: ${item.makingCharge}, Additional Cost: ${item.additionalCost
    //             }, Total: ${item.total.toFixed(2)}`,
    //             10,
    //             90 + index * 10
    //         );
    //     });

    //     doc.text("Invoice Summary:", 10, 140);
    //     doc.text(`Purchase Gold: ${summary.purchaseGold.toFixed(2)}`, 10, 150);
    //     doc.text(`Sell Gold: ${summary.sellGold.toFixed(2)}`, 10, 160);
    //     doc.text(`Tax: ${summary.tax.toFixed(2)}`, 10, 170);
    //     doc.text(`Final Total: ${summary.finalTotal.toFixed(2)}`, 10, 180);

    //     // Save the PDF
    //     doc.save(`Invoice_${invoiceNumber}.pdf`);

    //     alert("PDF Invoice downloaded successfully!");
    // };

    const navigate = useNavigate()

    const handleLogout = () => {
        console.log('hello')
        navigate('/')
    };

    const generateBill = () => {
        const doc = new jsPDF();
    
        const x1 = 10;  // X position for the Invoice Number
        const x2 = 150; // X position for the Date (adjust based on your page width)
        const yStart = 10;  // Starting Y position
        const lineHeight = 10;  // Line height for text
    
        doc.text(`Invoice Number: ${invoiceNumber}`, x1, yStart);
        doc.text(`Date: ${currentDate}`, x2, yStart);
    
        let yPosition = 30;
        doc.text("Customer Details:", 10, yPosition);
        doc.text(`Name: ${customer.name}`, 10, yPosition + lineHeight);
        doc.text(`Contact: ${customer.contact}`, 10, yPosition + 2 * lineHeight);
        doc.text(`Alternate Contact: ${customer.alternateContact}`, 10, yPosition + 3 * lineHeight);
        doc.text(`Address: ${customer.address}`, 10, yPosition + 4 * lineHeight);
    
        yPosition += 40;
        doc.text("New Gold Purchase:", 10, yPosition);
        items.forEach((item, index) => {
            yPosition += 10;
            doc.text(
                `Item ${index + 1}: ${item.itemName}, Gold Rate: ${item.goldRate}, Net Weight: ${item.netWeight
                }, Gross Weight: ${item.grossWeight}, Making Charge: ${item.makingCharge}, Additional Cost: ${item.additionalCost
                }, Total: ${item.total.toFixed(2)}`,
                10,
                yPosition
            );
        });
    
        yPosition += 40;
        doc.text("Invoice Summary:", 10, yPosition);
        doc.text(`Purchase Gold: ${summary.purchaseGold.toFixed(2)}`, 10, yPosition + lineHeight);
        doc.text(`Sell Gold: ${summary.sellGold.toFixed(2)}`, 10, yPosition + 2 * lineHeight);
        doc.text(`Tax: ${summary.tax.toFixed(2)}`, 10, yPosition + 3 * lineHeight);
        doc.text(`Final Total: ${summary.finalTotal.toFixed(2)}`, 10, yPosition + 4 * lineHeight);
    
        // Save the PDF
        doc.save(`Invoice_${invoiceNumber}.pdf`);
    
        alert("PDF Invoice downloaded successfully!");
    };


    const calculateTotalWithTax = () => {
        const purchaseGold = summary.purchaseGold;
        const cgstAmount = (purchaseGold * cgst) / 100;
        const sgstAmount = (purchaseGold * sgst) / 100;
        const totalWithTax = purchaseGold + cgstAmount + sgstAmount;

        return totalWithTax.toFixed(2);

    };

    return (
        <div style={{ margin: "10px 20px" }}>

            <div className="d-flex justify-content-between">
                <img src={radha} />
                <button className="btn btn-danger" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            <div className="card mt-4">
                <div className="card-header bg-dark text-white">Invoice Details</div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Invoice Number</label>
                            <input
                                type="text"
                                className="form-control"
                                value={invoiceNumber || ""}
                                readOnly
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Date</label>
                            <input
                                type="text"
                                className="form-control"
                                value={currentDate}
                                readOnly
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Details */}
            <div className="card mt-4">
                <div className="card-header bg-primary text-white">Customer Details</div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <label className="form-label">Customer Name</label>
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                value={customer.name}
                                onChange={handleCustomerChange}
                                placeholder="Enter name"
                            />
                        </div>
                        <div className="col-md-4 mb-3">
                            <label className="form-label">Contact Number</label>
                            <input
                                type="text"
                                className="form-control"
                                name="contact"
                                value={customer.contact}
                                onChange={handleCustomerChange}
                                placeholder="Enter contact number"
                            />
                        </div>
                        <div className="col-md-4 mb-3">
                            <label className="form-label">Alternate Contact Number</label>
                            <input
                                type="text"
                                className="form-control"
                                name="alternateContact"
                                value={customer.alternateContact}
                                onChange={handleCustomerChange}
                                placeholder="Enter alternate contact number"
                            />
                        </div>
                        <div className="col-md-12 mb-3">
                            <label className="form-label">Address</label>
                            <input
                                type="text"
                                className="form-control"
                                name="address"
                                value={customer.address}
                                onChange={handleCustomerChange}
                                placeholder="Enter customer address"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* New Gold Purchase Section */}
            {/* <div className="card mt-4">
                <div className="card-header bg-success text-white">New Gold Purchase</div>
                <div className="card-body">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Sl. No</th>
                                <th>Item Name</th>
                                <th>Gold Rate</th>
                                <th>Net Weight (gms)</th>
                                <th>Gross Weight (gms)</th>
                                <th>Per Gram Making Charge</th>
                                <th>Total Making Charge</th>
                                <th>Additional Cost</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={item.itemName}
                                            onChange={(e) =>
                                                handleItemChange(index, "itemName", e.target.value)
                                            }
                                            placeholder="Item Name"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={item.goldRate}
                                            onChange={(e) =>
                                                handleItemChange(index, "goldRate", e.target.value)
                                            }
                                            placeholder="Gold Rate"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={item.netWeight}
                                            onChange={(e) =>
                                                handleItemChange(index, "netWeight", e.target.value)
                                            }
                                            placeholder="Net Weight"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={item.grossWeight}
                                            onChange={(e) =>
                                                handleItemChange(index, "grossWeight", e.target.value)
                                            }
                                            placeholder="Gross Weight"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={item.makingChargePerGram}
                                            onChange={(e) =>
                                                handleItemChange(index, "makingChargePerGram", e.target.value)
                                            }
                                            placeholder="Per Gram Making Charge"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={item.makingCharge.toFixed(2)}
                                            readOnly
                                            placeholder="Total Making Charge"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={item.additionalCost}
                                            onChange={(e) =>
                                                handleItemChange(index, "additionalCost", e.target.value)
                                            }
                                            placeholder="Additional Cost"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={item.total.toFixed(2)}
                                            readOnly
                                            placeholder="Total"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button className="btn btn-secondary" onClick={addItemRow}>
                        Add New Item
                    </button>
                </div>
            </div> */}

            <div className="card mt-4">
                <div className="card-header bg-success text-white">New Gold Purchase</div>
                <div className="card-body">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Sl. No</th>
                                <th>Item Name</th>
                                <th>Gold Rate</th>
                                <th>Net Weight (gms)</th>
                                {/* <th>Total Gold Price</th>  */}
                                {/* <th>Gross Weight (gms)</th> */}
                                <th>Per Gram Making Charge</th>
                                <th>Total Making Charge</th>
                                <th>Total Gold Price</th>
                                <th>Additional Cost</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <input type="text" className="form-control" value={item.itemName} onChange={(e) => handleItemChange(index, "itemName", e.target.value)} placeholder="Item Name" />
                                    </td>
                                    <td>
                                        <input type="number" className="form-control" value={item.goldRate} onChange={(e) => handleItemChange(index, "goldRate", e.target.value)} placeholder="Gold Rate" />
                                    </td>
                                    <td>
                                        <input type="number" className="form-control" value={item.netWeight} onChange={(e) => handleItemChange(index, "netWeight", e.target.value)} placeholder="Net Weight" />
                                    </td>
                                    {/* Other existing fields */}
                                    {/* <td><input type="number" className="form-control" value={item.grossWeight} onChange={(e) => handleItemChange(index, "grossWeight", e.target.value)} placeholder="Gross Weight" /></td> */}
                                    <td><input type="number" className="form-control" value={item.makingChargePerGram} onChange={(e) => handleItemChange(index, "makingChargePerGram", e.target.value)} placeholder="Per Gram Making Charge" /></td>
                                    <td><input type="text" className="form-control" value={item.makingCharge.toFixed(2)} readOnly placeholder="Total Making Charge" /></td>
                                    <td>
                                        <input type="text" className="form-control" value={item.calculatedGoldPrice.toFixed(2)} readOnly placeholder="Calculated Gold Price" /> {/* New Input Field */}
                                    </td>
                                    <td><input type="number" className="form-control" value={item.additionalCost} onChange={(e) => handleItemChange(index, "additionalCost", e.target.value)} placeholder="Additional Cost" /></td>
                                    <td><input type="text" className="form-control" value={item.total.toFixed(2)} readOnly placeholder="Total" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* Button to add new item */}
                    <button className="btn btn-secondary" onClick={addItemRow}> Add New Item </button>
                </div>
            </div>


            {/* Old Gold Section */}
            <div className="card mt-4">
                <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                    <span>Sell Old Gold</span>
                    <button className="btn btn-sm btn-outline-dark" onClick={toggleOldGoldSection}>
                        {isOldGoldOpen ? "Collapse" : "Expand"}
                    </button>
                </div>
                <div
                    className={`card-body collapse ${isOldGoldOpen ? "show" : ""}`}
                    style={{ transition: "height 0.3s ease" }}
                >
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Sl. No</th>
                                <th>Item Name</th>
                                <th>Gold Rate</th>
                                <th>Weight</th>
                                <th>Tunch (%)</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {oldGoldItems.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={item.itemName}
                                            onChange={(e) =>
                                                handleOldGoldChange(index, "itemName", e.target.value)
                                            }
                                            placeholder="Item Name"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={item.goldRate}
                                            onChange={(e) =>
                                                handleOldGoldChange(index, "goldRate", e.target.value)
                                            }
                                            placeholder="Gold Rate"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={item.weight}
                                            onChange={(e) =>
                                                handleOldGoldChange(index, "weight", e.target.value)
                                            }
                                            placeholder="Weight"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={item.tunchPercentage}
                                            onChange={(e) =>
                                                handleOldGoldChange(index, "tunchPercentage", e.target.value)
                                            }
                                            placeholder="Tunch (%)"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={item.total.toFixed(2)}
                                            readOnly
                                            placeholder="Total"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button className="btn btn-secondary" onClick={addOldGoldRow}>
                        Add Old Gold Item
                    </button>
                </div>
            </div>

            {/* Invoice Summary */}
            <div className="card mt-4">
                <div className="card-body">

                    <div className="card">
                        <div className="card-header bg-info text-white">Invoice Summary</div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Purchase Gold</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={summary.purchaseGold.toFixed(2)}
                                        readOnly
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">CGST (%)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={cgst}
                                        onChange={(e) => setCgst(+e.target.value)}
                                        placeholder="Enter CGST"
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">SGST (%)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={sgst}
                                        onChange={(e) => setSgst(+e.target.value)}
                                        placeholder="Enter SGST"
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Total Amount (with Tax)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={calculateTotalWithTax()}
                                        readOnly
                                    />
                                </div>
                            </div>

                            
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Sell Old Gold</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={summary.sellGold.toFixed(2)}
                                        readOnly
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Final Total</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={summary.finalTotal.toFixed(2)}
                                        readOnly
                                    />
                                </div>

                            </div>
                        </div>
                    </div>

                    <button className="btn btn-primary w-100" onClick={generateBill}>
                        Generate Bill
                    </button>
                </div>
            </div>

        </div>
    );
};

export default Invoice;


