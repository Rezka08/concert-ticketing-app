import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/admin';
import { concertsAPI } from '../../services/concerts';
import { formatCurrency, formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { HiDownload, HiCalendar, HiCurrencyDollar, HiTicket, HiTrendingUp } from 'react-icons/hi';
import toast from 'react-hot-toast';

const SalesReports = () => {
  const [reportData, setReportData] = useState(null);
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    concert_id: ''
  });

  useEffect(() => {
    fetchConcerts();
    generateReport();
  }, []);

  const fetchConcerts = async () => {
    try {
      const response = await concertsAPI.getConcerts({ per_page: 100 });
      setConcerts(response.data.data.items);
    } catch (error) {
      console.error('Failed to fetch concerts');
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.concert_id) params.concert_id = filters.concert_id;
      
      const response = await adminAPI.getSalesReport(params);
      setReportData(response.data.data);
    } catch (error) {
      setError('Failed to generate sales report');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleGenerateReport = () => {
    generateReport();
  };

  const clearFilters = () => {
    setFilters({
      start_date: '',
      end_date: '',
      concert_id: ''
    });
  };

  const exportToCSV = () => {
    if (!reportData || !reportData.details.length) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Concert Title', 'Venue', 'Concert Date', 'Ticket Type', 'Price', 'Tickets Sold', 'Revenue'];
    const csvContent = [
      headers.join(','),
      ...reportData.details.map(row => [
        `"${row.concert_title}"`,
        `"${row.venue}"`,
        row.concert_date,
        `"${row.ticket_name}"`,
        row.price,
        row.total_sold,
        row.total_revenue
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Report exported successfully');
  };

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">Sales Reports</h1>
            <p className="text-base-content/70">Analyze concert ticket sales and revenue</p>
          </div>
          {reportData && reportData.details.length > 0 && (
            <button onClick={exportToCSV} className="btn btn-primary">
              <HiDownload className="w-5 h-5 mr-2" />
              Export CSV
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body">
            <h3 className="card-title mb-4">Report Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Start Date</span>
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={filters.start_date}
                  onChange={handleFilterChange}
                  className="input input-bordered"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">End Date</span>
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={filters.end_date}
                  onChange={handleFilterChange}
                  className="input input-bordered"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Concert</span>
                </label>
                <select
                  name="concert_id"
                  value={filters.concert_id}
                  onChange={handleFilterChange}
                  className="select select-bordered"
                >
                  <option value="">All Concerts</option>
                  {concerts.map((concert) => (
                    <option key={concert.concert_id} value={concert.concert_id}>
                      {concert.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">&nbsp;</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={handleGenerateReport}
                    className="btn btn-primary flex-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Generating...
                      </>
                    ) : (
                      'Generate Report'
                    )}
                  </button>
                  {(filters.start_date || filters.end_date || filters.concert_id) && (
                    <button onClick={clearFilters} className="btn btn-ghost">
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Content */}
        {loading ? (
          <LoadingSpinner text="Generating sales report..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={generateReport} />
        ) : reportData ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-base-content/70">Total Revenue</h3>
                      <p className="text-2xl font-bold text-success">
                        {formatCurrency(reportData.summary.total_revenue)}
                      </p>
                    </div>
                    <HiCurrencyDollar className="w-8 h-8 text-success" />
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-base-content/70">Tickets Sold</h3>
                      <p className="text-2xl font-bold text-primary">
                        {reportData.summary.total_tickets_sold}
                      </p>
                    </div>
                    <HiTicket className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-base-content/70">Concerts</h3>
                      <p className="text-2xl font-bold text-secondary">
                        {reportData.summary.total_concerts}
                      </p>
                    </div>
                    <HiTrendingUp className="w-8 h-8 text-secondary" />
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Report Table */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title mb-4">Detailed Sales Report</h3>
                
                {reportData.details.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-base-content/70">No sales data found for the selected criteria</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table table-zebra">
                      <thead>
                        <tr>
                          <th>Concert</th>
                          <th>Venue</th>
                          <th>Date</th>
                          <th>Ticket Type</th>
                          <th>Price</th>
                          <th>Sold</th>
                          <th>Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.details.map((row, index) => (
                          <tr key={index}>
                            <td>
                              <div className="font-medium">{row.concert_title}</div>
                            </td>
                            <td>{row.venue}</td>
                            <td>{formatDate(row.concert_date)}</td>
                            <td>
                              <div className="badge badge-outline">{row.ticket_name}</div>
                            </td>
                            <td>{formatCurrency(row.price)}</td>
                            <td>
                              <div className="font-medium">{row.total_sold}</div>
                            </td>
                            <td>
                              <div className="font-bold text-success">
                                {formatCurrency(row.total_revenue)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="font-bold">
                          <th colSpan="5">Total</th>
                          <th>{reportData.summary.total_tickets_sold}</th>
                          <th className="text-success">
                            {formatCurrency(reportData.summary.total_revenue)}
                          </th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <HiTrendingUp className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Generate Sales Report</h3>
            <p className="text-base-content/70">
              Use the filters above to generate a detailed sales report
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesReports;