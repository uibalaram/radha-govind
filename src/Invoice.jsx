import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useNavigate } from 'react-router-dom'
import radha from './assets/radha.png'
import jsPDF from "jspdf";
import Swal from "sweetalert2";

const Invoice = () => {
    const [customer, setCustomer] = useState({
        name: "",
        contact: "",
        alternateContact: "",
        address: "",
    });
    const [items, setItems] = useState([
        {
            itemName: '',
            goldRate: '',
            netWeight: '',
            grossWeight: '',
            makingCharge: '',
            additionalCost: '',
            total: '',
            calculatedGoldPrice: '' ,
        },
    ]);

    const [oldGoldItems, setOldGoldItems] = useState([
        { slNo: 1, itemName: "", goldRate: "", weight: "", tunchPercentage: 100, total: "" },
    ]);

    const [summary, setSummary] = useState({
        purchaseGold: '',
        sellGold: '',
        tax: '',
        finalTotal: '',
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

        console.log(index, field, value)


        // Update the field value
        updatedItems[index][field] =
            // ["goldRate", "netWeight", "grossWeight", "makingCharge", "additionalCost", "makingChargePerGram"].includes(field) && Number(value);
            ["goldRate", "netWeight", "grossWeight", "makingCharge", "additionalCost", "makingChargePerGram"].includes(field)
        ? Number(value)
        : value;

        // Calculate the calculatedGoldPrice (Gold Rate * Net Weight)
        updatedItems[index].calculatedGoldPrice = updatedItems[index].goldRate * updatedItems[index].netWeight;

        // Recalculate making charge if either 'makingChargePerGram' or 'netWeight' is updated
        if (field === "makingChargePerGram" || field === "netWeight") {
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
                goldRate: '',
                netWeight: '',
                grossWeight: '',
                makingCharge: '',
                additionalCost: '',
                total: '',
            },
        ]);
    };

    const [cgst, setCgst] = useState('');
    const [sgst, setSgst] = useState('');


    // const updateSummary = (items, oldGoldItems) => {
    //     // const purchaseGold = items.reduce((acc, item) => acc + item.total, '');
    //     const purchaseGold = items.reduce((acc, item) => acc + Number(item.total || 0), 0.toFixed(2));
    //     const sellGold = oldGoldItems.reduce((acc, item) => acc + item.total, 0);
    //     const cgstAmount = cgst > 0 ? Number(purchaseGold * (cgst / 100)) : 0;
    //     const sgstAmount = sgst > 0 ? Number(purchaseGold * (sgst / 100)) : 0;

    //     const totalWithTax = Number(purchaseGold || 0) + cgstAmount + sgstAmount;
    //     console.log(totalWithTax, '---totalWithTax')

    //     const finalTotal =  sellGold ? Number(totalWithTax - sellGold) : totalWithTax;

    //     console.log(purchaseGold, '----- purchaseGold')
    //     setSummary({
    //         purchaseGold: purchaseGold || '',
    //         sellGold: sellGold || '',
    //         cgst: cgstAmount,
    //         sgst: sgstAmount,
    //         totalWithTax,
    //         finalTotal,
    //     });
    // };

    const updateSummary = (items, oldGoldItems) => {
        const purchaseGold = Number(items.reduce((acc, item) => acc + Number(item.total || 0), 0).toFixed(2));
        const sellGold = Number(oldGoldItems.reduce((acc, item) => acc + Number(item.total || 0), 0).toFixed(2));
        const cgstAmount = cgst > 0 ? Number((purchaseGold * (cgst / 100)).toFixed(2)) : 0;
        const sgstAmount = sgst > 0 ? Number((purchaseGold * (sgst / 100)).toFixed(2)) : 0;
    
        const totalWithTax = Number((purchaseGold + cgstAmount + sgstAmount).toFixed(2));
        const finalTotal = sellGold ? Number((totalWithTax - sellGold).toFixed(2)) : totalWithTax;
    
        setSummary({
            purchaseGold,
            sellGold,
            cgst: cgstAmount,
            sgst: sgstAmount,
            totalWithTax,
            finalTotal,
        });
    };
    useEffect(() => {
        updateSummary(items, oldGoldItems);
    }, [items, oldGoldItems, cgst, sgst]);



    // Toggle Old Gold Section
    const toggleOldGoldSection = () => {
        setIsOldGoldOpen((prev) => !prev);
    };

    const navigate = useNavigate()

    const handleLogout = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You will be logged out!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, logout",
            cancelButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Logged out successfully",
                    showConfirmButton: false,
                    timer: 1500,
                });
                navigate("/");
            }
        });
    };

    const calculateTotalWithTax = () => {
        const purchaseGold = Number(summary.purchaseGold);
        const cgstAmount = Number((purchaseGold * cgst) / 100);
        const sgstAmount = Number((purchaseGold * sgst) / 100);
        const totalWithTax = Number(purchaseGold + cgstAmount + sgstAmount);

        return totalWithTax?.toString();

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
                }, Total: ${item.total}`,
                10,
                yPosition
            );
        });

        yPosition += 40;
        doc.text("Invoice Summary:", 10, yPosition);
        doc.text(`Purchase Gold: ${summary.purchaseGold}`, 10, yPosition + lineHeight);
        doc.text(`Sell Gold: ${summary.sellGold}`, 10, yPosition + 2 * lineHeight);
        doc.text(`Tax: ${summary.tax}`, 10, yPosition + 3 * lineHeight);
        doc.text(`Final Total: ${summary.finalTotal}`, 10, yPosition + 4 * lineHeight);

        // Save the PDF
        doc.save(`Invoice_${invoiceNumber}.pdf`);

        alert("PDF Invoice downloaded successfully!");
    };

    return (
        <div style={{ margin: "10px 20px" }}>

            <div className="d-flex flex-wrap gap-3 justify-content-between">
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
                                type="number"
                                className="form-control"
                                name="contact"
                                value={customer.contact.toString()}
                                onChange={handleCustomerChange}
                                placeholder="Enter contact number"
                            />
                        </div>
                        <div className="col-md-4 mb-3">
                            <label className="form-label">Alternate Contact Number</label>
                            <input
                                type="number"
                                className="form-control"
                                name="alternateContact"
                                value={customer.alternateContact.toString()}
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

            <div className="card mt-4">
                <div className="card-header bg-success text-white">New Gold Purchase</div>
                <div className="card-body">
                    <div className="invoice-table table-responsive">
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Sl. No</th>
                                    <th width="200">Item Name</th>
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
                                            <input type="number" className="form-control" value={item.goldRate.toString()} onChange={(e) => handleItemChange(index, "goldRate", e.target.value)} placeholder="Gold Rate" />
                                        </td>
                                        <td>
                                            <input type="number" className="form-control" value={item.netWeight.toString()} onChange={(e) => handleItemChange(index, "netWeight", e.target.value)} placeholder="Net Weight" />
                                        </td>
                                        {/* Other existing fields */}
                                        {/* <td><input type="number" className="form-control" value={item.grossWeight} onChange={(e) => handleItemChange(index, "grossWeight", e.target.value)} placeholder="Gross Weight" /></td> */}
                                        <td><input type="number" className="form-control" value={item.makingChargePerGram?.toString()} onChange={(e) => handleItemChange(index, "makingChargePerGram", e.target.value)} placeholder="Per Gram Making Charge" /></td>
                                        <td><input type="text" className="form-control" value={item.makingCharge} readOnly placeholder="Total Making Charge" /></td>
                                        <td>
                                            <input type="text" className="form-control" value={Number(item.calculatedGoldPrice)?.toFixed(2)} readOnly placeholder="Calculated Gold Price" />
                                        </td>
                                        <td><input type="text" className="form-control" value={item.additionalCost} onChange={(e) => handleItemChange(index, "additionalCost", e.target.value)} placeholder="Additional Cost" /></td>
                                        <td><input type="text" className="form-control" value={item.total} readOnly placeholder="Total" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
                    <div className="table-responsive gold-section-tbl">
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
                                            value={item.goldRate?.toString()}
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
                                            value={item.weight.toString()}
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
                                            value={item.tunchPercentage.toString()}
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
                                            value={item.total.toString()}
                                            readOnly
                                            placeholder="Total"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
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
                                        type="number"
                                        className="form-control"
                                        value={summary.purchaseGold.toString()}
                                        readOnly
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">CGST (%)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={cgst.toString()}
                                        onChange={(e) => setCgst(+e.target.value)}
                                        placeholder="Enter CGST"
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">SGST (%)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={sgst.toString()}
                                        onChange={(e) => setSgst(+e.target.value)}
                                        placeholder="Enter SGST"
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Total Amount (with Tax)</label>
                                    <input
                                        type="number"
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
                                        value={Number(summary.sellGold)}
                                        readOnly
                                    />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Final Total</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={summary.finalTotal}
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


