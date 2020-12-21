// "use strict";

// fetch('./myFirstDatasetCleaned.json')
//     .then(function (resp) {
//         return resp.json();
//     })
//     .then(function (data) {
//         // console.log(data);
//         $('#paperTable').DataTable({
//             data: data,
//             columns: [
//                 { data: 'Index' },
//                 { data: 'Cord_UID' },
//                 { data: 'Paper_ID' },
//                 { data: 'Nation' },
//                 { data: 'Title' },
//                 { data: 'Publish_time' }
//             ],
//             scrollResize: true,
//             scrollY: 100,
//             scrollCollapse: true,
//             paging: true
//         });
//     });

function Table(dataset) {
    if ($.fn.dataTable.isDataTable('#paperTable')) {
        $('#paperTable').DataTable().clear().destroy();
    }
    $('#paperTable').DataTable({
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
        scrollResize: true,
        scrollY: 100,
        scrollCollapse: true,
        paging: true
    });

    var table = document.getElementById('paperTable');
    resizableGrid(table);
}

function resizableGrid(table) {
    var row = table.getElementsByTagName('tr')[0],
        cols = row ? row.children : undefined;
    if (!cols) return;

    table.style.overflow = 'hidden';

    var tableHeight = table.offsetHeight;

    for (var i = 0; i < cols.length; i++) {
        var div = createDiv(tableHeight);
        cols[i].appendChild(div);
        cols[i].style.position = 'relative';
        setListeners(div);
    }

    function setListeners(div) {
        var pageX, curCol, nxtCol, curColWidth, nxtColWidth;

        div.addEventListener('mousedown', function (e) {
            curCol = e.target.parentElement;
            nxtCol = curCol.nextElementSibling;
            pageX = e.pageX;

            var padding = paddingDiff(curCol);

            curColWidth = curCol.offsetWidth - padding;
            if (nxtCol)
                nxtColWidth = nxtCol.offsetWidth - padding;
        });

        div.addEventListener('mouseover', function (e) {
            e.target.style.borderRight = '2px solid #0000ff';
        })

        div.addEventListener('mouseout', function (e) {
            e.target.style.borderRight = '';
        })

        document.addEventListener('mousemove', function (e) {
            if (curCol) {
                var diffX = e.pageX - pageX;

                if (nxtCol)
                    nxtCol.style.width = (nxtColWidth - (diffX)) + 'px';

                curCol.style.width = (curColWidth + diffX) + 'px';
            }
        });

        document.addEventListener('mouseup', function (e) {
            curCol = undefined;
            nxtCol = undefined;
            pageX = undefined;
            nxtColWidth = undefined;
            curColWidth = undefined
        });
    }

    function createDiv(height) {
        var div = document.createElement('div');
        div.style.top = 0;
        div.style.right = 0;
        div.style.width = '5px';
        div.style.position = 'absolute';
        div.style.cursor = 'col-resize';
        div.style.userSelect = 'none';
        div.style.height = height + 'px';
        return div;
    }

    function paddingDiff(col) {

        if (getStyleVal(col, 'box-sizing') == 'border-box') {
            return 0;
        }

        var padLeft = getStyleVal(col, 'padding-left');
        var padRight = getStyleVal(col, 'padding-right');
        return (parseInt(padLeft) + parseInt(padRight));

    }

    function getStyleVal(elm, css) {
        return (window.getComputedStyle(elm, null).getPropertyValue(css))
    }
};