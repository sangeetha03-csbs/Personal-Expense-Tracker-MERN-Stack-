
import { useEffect, useState } from 'react'

function App() {
  const [transactions, setTransactions] = useState([])
  const [type, setType] = useState('Expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [filterCategory, setFilterCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  // Load saved transactions from MongoDB
  useEffect(() => {
    async function loadTransactions() {
      try {
        const response = await fetch(
          'http://localhost:5000/transactions'
        )

        if (!response.ok) {
          throw new Error('Could not load transactions')
        }

        const data = await response.json()
        setTransactions(data)
      } catch (error) {
        console.error(error)
        alert('Could not load transactions. Check your backend.')
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [])

  // Add a transaction
  async function addTransaction(event) {
    event.preventDefault()

    const newTransaction = {
      type,
      amount: Number(amount),
      category,
      description,
      date,
    }

    try {
      const response = await fetch(
        'http://localhost:5000/transactions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTransaction),
        }
      )

      if (!response.ok) {
        throw new Error('Could not save transaction')
      }

      const savedTransaction = await response.json()

      setTransactions((previous) => [
        ...previous,
        savedTransaction,
      ])

      setAmount('')
      setCategory('')
      setDescription('')
      setType('Expense')
      setDate(new Date().toISOString().slice(0, 10))
    } catch (error) {
      console.error(error)
      alert('Unable to save transaction. Check your backend.')
    }
  }

  // Edit a transaction
  async function editTransaction(item) {
    const newAmount = prompt(
      'Enter the new amount:',
      item.amount
    )

    if (newAmount === null) return

    const amountValue = Number(newAmount)

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      alert('Enter an amount greater than zero.')
      return
    }

    const newDescription = prompt(
      'Enter the new description:',
      item.description || ''
    )

    if (newDescription === null) return

    try {
      const response = await fetch(
        `http://localhost:5000/transactions/${item._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amountValue,
            description: newDescription,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Could not update transaction')
      }

      const updatedTransaction = await response.json()

      setTransactions((previous) =>
        previous.map((transaction) =>
          transaction._id === item._id
            ? updatedTransaction
            : transaction
        )
      )
    } catch (error) {
      console.error(error)
      alert('Could not edit transaction. Check your backend.')
    }
  }

  // Delete a transaction
  async function deleteTransaction(id) {
    if (!window.confirm('Delete this transaction?')) return

    try {
      const response = await fetch(
        `http://localhost:5000/transactions/${id}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Could not delete transaction')
      }

      setTransactions((previous) =>
        previous.filter((item) => item._id !== id)
      )
    } catch (error) {
      console.error(error)
      alert('Could not delete transaction. Check your backend.')
    }
  }

  const totalIncome = transactions
    .filter((item) => item.type === 'Income')
    .reduce((total, item) => total + Number(item.amount), 0)

  const totalExpenses = transactions
    .filter((item) => item.type === 'Expense')
    .reduce((total, item) => total + Number(item.amount), 0)

  const balance = totalIncome - totalExpenses

  const filteredTransactions = transactions.filter(
    (item) =>
      filterCategory === 'All' ||
      item.category === filterCategory
  )

  return (
    <div className="container py-5">
      <h1 className="fw-bold mb-2">
        Personal Expense Tracker
      </h1>

      <p className="text-secondary mb-4">
        Manage your income and expenses in one place.
      </p>

      {/* Dashboard summary */}
      <div className="row g-3 mb-5">
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 p-3">
            <p className="text-secondary mb-2">Balance</p>
            <h2 className="fw-bold">
              ₹{balance.toLocaleString('en-IN')}
            </h2>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 p-3">
            <p className="text-secondary mb-2">Income</p>
            <h2 className="fw-bold text-success">
              ₹{totalIncome.toLocaleString('en-IN')}
            </h2>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 p-3">
            <p className="text-secondary mb-2">Expenses</p>
            <h2 className="fw-bold text-danger">
              ₹{totalExpenses.toLocaleString('en-IN')}
            </h2>
          </div>
        </div>
      </div>

      {/* Add transaction form */}
      <div className="card shadow-sm border-0 p-4 mb-5">
        <h3 className="fw-bold mb-4">Add Transaction</h3>

        <form onSubmit={addTransaction}>
          <div className="mb-3">
            <label className="form-label">
              Transaction Type
            </label>
            <select
              className="form-select"
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option>Expense</option>
              <option>Income</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Amount (₹)</label>
            <input
              type="number"
              className="form-control"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount"
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
            >
              <option value="">Select category</option>
              <option>Food</option>
              <option>Travel</option>
              <option>Education</option>
              <option>Salary</option>
              <option>Shopping</option>
              <option>Other</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-control"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="e.g. Lunch or monthly salary"
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Add Transaction
          </button>
        </form>
      </div>

      {/* Transaction history */}
      <div className="card shadow-sm border-0 p-4">
        <h3 className="fw-bold mb-3">Transaction History</h3>

        <div className="mb-3">
          <label className="form-label">
            Filter by Category
          </label>
          <select
            className="form-select"
            value={filterCategory}
            onChange={(event) =>
              setFilterCategory(event.target.value)
            }
          >
            <option value="All">All Categories</option>
            <option>Food</option>
            <option>Travel</option>
            <option>Education</option>
            <option>Salary</option>
            <option>Shopping</option>
            <option>Other</option>
          </select>
        </div>

        {loading ? (
          <p>Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="text-secondary mb-0">
            No transactions yet. Add your first transaction above.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th className="text-end">Amount</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((item) => (
                  <tr key={item._id}>
                    <td>{item.type}</td>
                    <td>{item.category}</td>
                    <td>{item.description || '-'}</td>
                    <td>{item.date || '-'}</td>
                    <td
                      className={`text-end fw-bold ${
                        item.type === 'Income'
                          ? 'text-success'
                          : 'text-danger'
                      }`}
                    >
                      {item.type === 'Income' ? '+' : '-'}₹
                      {Number(item.amount).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary me-2 mb-1"
                        onClick={() => editTransaction(item)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger mb-1"
                        onClick={() => deleteTransaction(item._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default App