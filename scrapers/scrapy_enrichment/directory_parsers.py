"""Extract only the named business area, never the publisher's footer."""
from urllib.parse import urlparse
import re
from parsel import Selector


def scoped_contacts(record,body,url,matches,contacts,page_type):
    from collect import county_match
    tree=Selector(body);host=urlparse(url).hostname or '';found=[]
    if host.endswith('yellow.co.ke'):
        scope=tree.css('#company-profile')
        if not scope or not matches(record,scope.css('h2').xpath('normalize-space(.)').get('')):return []
        if county_match(record,' '.join(scope.xpath('.//text()').getall()))=='conflicting':return []
        for address in scope.css('h5').xpath('normalize-space(.)').getall():
            if address:found.append(('address',address))
        found.extend(contacts(page_type(scope.get())))
    elif host.endswith('medpages.info'):
        if not matches(record,tree.css('h1.main-name').xpath('normalize-space(.)').get('')):return []
        # This publisher covers many countries. The business's own details,
        # rather than a search query or site navigation, must support Kenya.
        business_details=' '.join(tree.css('table.info-table').xpath('.//text()').getall()).casefold()
        if not re.search(r'\bkenya\b',business_details) or county_match(record,business_details)=='conflicting':return []
        for row in tree.css('table.info-table tr'):
            label=row.xpath('normalize-space(td[1])').get('').lower().strip(': ')
            cell=row.xpath('td[2]')
            value=' '.join(cell.xpath('.//text()').getall()).strip()
            value=' '.join(value.split())
            if label in {'address','postal address','physical address'} and value:found.append(('address',value))
            elif label in {'location','town','city'} and value:found.append(('location',value))
            elif any(k in label for k in ('telephone','phone','mobile','fax','email')):
                found.extend(contacts(page_type(cell.get(''))))
            elif 'website' in label:
                for link in cell.css('a::attr(href)').getall():
                    if link.startswith(('http://','https://')):found.append(('website',link))
    return sorted(set(found))
