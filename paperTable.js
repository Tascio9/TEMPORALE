// ---------------------------------------------------------
// Takes in input an object (NOT A LIST WITH NATIONS, DATE ecc... )
// "dataset" and draw it.
function Table(dataset) {
    console.log(typeof (dataset))
    console.log({ dataset })

    if ($.fn.dataTable.isDataTable('#paperTable')) {
        $('#paperTable').DataTable().clear().draw();;
        $('#paperTable').DataTable().rows.add(dataset); // Add new data
        $('#paperTable').DataTable().columns.adjust().draw(); // Redraw the DataTable
        console.log('Distrutto')
    } else {
        $('#paperTable').DataTable({
            dom: 'Zlfrtip',             // Needed to use colResize. See it on index.html
            data: dataset,
            columns: [
                { data: 'Cord_UID' },
                {
                    data: 'Title',
                    render: function (data, type, row) {
                        return `<a href="https://www.doi.org/${row.DOI}" target="_blank">${data}</a>`
                    }
                },
                {
                    data: 'First_author',
                    render: function (data, type, row) {
                        return `${data} et al .`
                    }
                },
                { data: 'Nation' },
                { data: 'Publish_time' },
                { data: 'Journal' },
                { data: 'Classification' }
            ],
            // pageResize: true,
            scrollResize: true,
            // scrollY: '15vh',
            scrollCollapse: true,
            paging: true
        });
        const newTabButton = document.createElement('button')
        newTabButton.innerHTML = "Open in a new tab"
        newTabButton.addEventListener("click", function () {
            var win = window.open();
            win.focus();
        })
        document.getElementById('paperTable_filter').appendChild(newTabButton)
    }
}